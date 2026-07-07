const crypto = require('crypto');
const commandesRepo = require('../repositories/commandes.repo');
const facturesRepo = require('../repositories/factures.repo');
const factureService = require('./facture.service');
const { ServiceError } = require('./errors');
const { STATUTS_COMMANDE } = require('../constants/commandeStatuts');
const { ROLES } = require('../constants/roles');

const subscribers = new Map();

function subscribe(commandeId, res) {
  const key = String(commandeId);
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key).add(res);
  return () => {
    const set = subscribers.get(key);
    if (set) {
      set.delete(res);
      if (set.size === 0) subscribers.delete(key);
    }
  };
}

function publish(commandeId, statut) {
  const key = String(commandeId);
  const set = subscribers.get(key);
  if (!set) return;
  const payload = JSON.stringify({ commandeId, statut });
  const terminal = statut !== STATUTS_COMMANDE.EN_ATTENTE_PAIEMENT;
  for (const res of set) {
    res.write(`data: ${payload}\n\n`);
    if (terminal) res.end();
  }
  if (terminal) subscribers.delete(key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulerPaiement(commandeId) {
  const delay = 1500 + Math.round(Math.random() * 1000);
  await sleep(delay);
  await commandesRepo.setStatut(commandeId, STATUTS_COMMANDE.EN_ATTENTE_VALIDATION);
  publish(commandeId, STATUTS_COMMANDE.EN_ATTENTE_VALIDATION);
}

function generateReference() {
  return `HBE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

async function createCommandeFromLignes(utilisateurId, { telephone, lignes }) {
  const reference = generateReference();
  const montantTotal = lignes.reduce((total, ligne) => total + ligne.prixUnitaire * ligne.quantite, 0);

  const commandeId = await commandesRepo.createWithLignes({
    utilisateurId,
    telephone,
    reference,
    montantTotal,
    lignes
  });

  simulerPaiement(commandeId).catch((err) => {
    console.error(`La simulation de paiement pour la commande ${commandeId} a échoué:`, err.message);
  });

  return { commandeId, reference, statut: STATUTS_COMMANDE.EN_ATTENTE_PAIEMENT };
}

async function getStatut(commandeId) {
  const commande = await commandesRepo.findById(commandeId);
  return commande ? commande.statut : null;
}

async function validerCommande(commandeId) {
  const commande = await commandesRepo.findById(commandeId);
  if (!commande) {
    throw new ServiceError('COMMANDE_INTROUVABLE', 404);
  }
  if (commande.statut !== STATUTS_COMMANDE.EN_ATTENTE_VALIDATION) {
    throw new ServiceError('COMMANDE_NON_VALIDABLE', 409);
  }

  const lignes = await commandesRepo.findLignesByCommandeId(commandeId);
  const success = await commandesRepo.validerAvecDecrementStock(commandeId, lignes, STATUTS_COMMANDE.VALIDEE);
  if (!success) {
    throw new ServiceError('STOCK_INSUFFISANT', 409);
  }

  const facture = await factureService.genererFacture(commande, lignes);
  publish(commandeId, STATUTS_COMMANDE.VALIDEE);
  return facture;
}

async function rejeterCommande(commandeId) {
  const commande = await commandesRepo.findById(commandeId);
  if (!commande) {
    throw new ServiceError('COMMANDE_INTROUVABLE', 404);
  }
  if (commande.statut !== STATUTS_COMMANDE.EN_ATTENTE_VALIDATION) {
    throw new ServiceError('COMMANDE_NON_REJETABLE', 409);
  }

  await commandesRepo.setStatut(commandeId, STATUTS_COMMANDE.REJETEE);
  publish(commandeId, STATUTS_COMMANDE.REJETEE);
}

async function listEnAttenteValidation() {
  return commandesRepo.findEnAttenteValidation();
}

async function listMesCommandes(utilisateurId) {
  return commandesRepo.findByUtilisateur(utilisateurId);
}

async function listPaiements() {
  return commandesRepo.findHistoriquePaiements();
}

const ROLES_AUTORISES_FACTURE = [ROLES.CAISSIER, ROLES.GESTIONNAIRE_BOUTIQUE, ROLES.ADMIN];

async function getFactureAutorisee(commandeId, utilisateurCourant) {
  const commande = await commandesRepo.findById(commandeId);
  if (!commande) {
    throw new ServiceError('COMMANDE_INTROUVABLE', 404);
  }

  const estProprietaire = commande.utilisateur_id === utilisateurCourant.id;
  const estAutorise = estProprietaire || ROLES_AUTORISES_FACTURE.includes(utilisateurCourant.role);
  if (!estAutorise) {
    throw new ServiceError('FORBIDDEN', 403);
  }

  const facture = await facturesRepo.findByCommandeId(commandeId);
  if (!facture) {
    throw new ServiceError('FACTURE_INTROUVABLE', 404);
  }

  return facture;
}

module.exports = {
  createCommandeFromLignes,
  subscribe,
  getStatut,
  validerCommande,
  rejeterCommande,
  listEnAttenteValidation,
  listMesCommandes,
  listPaiements,
  getFactureAutorisee
};
