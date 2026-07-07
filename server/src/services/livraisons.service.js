const livraisonsRepo = require('../repositories/livraisons.repo');
const commandesRepo = require('../repositories/commandes.repo');
const utilisateursRepo = require('../repositories/utilisateurs.repo');
const { ServiceError } = require('./errors');
const { STATUTS_COMMANDE } = require('../constants/commandeStatuts');
const { ROLES } = require('../constants/roles');

const STATUTS_LIVRAISON = { ASSIGNEE: 'assignee', EN_COURS: 'en_cours', LIVREE: 'livree' };

async function listCommandesAExpedier() {
  return livraisonsRepo.findValideesSansLivraison();
}

async function listLivreurs() {
  const utilisateurs = await utilisateursRepo.findAll();
  return utilisateurs.filter((u) => u.role === ROLES.LIVRAISON);
}

async function attribuerLivreur(commandeId, livreurId) {
  const commande = await commandesRepo.findById(commandeId);
  if (!commande) {
    throw new ServiceError('COMMANDE_INTROUVABLE', 404);
  }
  if (commande.statut !== STATUTS_COMMANDE.VALIDEE) {
    throw new ServiceError('COMMANDE_NON_EXPEDIABLE', 409);
  }

  const existante = await livraisonsRepo.findByCommandeId(commandeId);
  if (existante) {
    throw new ServiceError('LIVRAISON_DEJA_ATTRIBUEE', 409);
  }

  const livreur = await utilisateursRepo.findById(livreurId);
  if (!livreur || livreur.role !== ROLES.LIVRAISON) {
    throw new ServiceError('LIVREUR_INVALIDE', 400);
  }

  const id = await livraisonsRepo.create(commandeId, livreurId);
  await commandesRepo.setStatut(commandeId, STATUTS_COMMANDE.EXPEDIEE);
  return { id };
}

async function listMesLivraisons(livreurId) {
  return livraisonsRepo.findByLivreur(livreurId);
}

async function listToutesLivraisons() {
  return livraisonsRepo.findAllAvecDetails();
}

function verifierAcces(livraison, utilisateurCourant) {
  const estProprietaire = livraison.livreur_id === utilisateurCourant.id;
  if (!estProprietaire && utilisateurCourant.role !== ROLES.ADMIN) {
    throw new ServiceError('FORBIDDEN', 403);
  }
}

async function marquerEnCours(livraisonId, utilisateurCourant) {
  const livraison = await livraisonsRepo.findById(livraisonId);
  if (!livraison) {
    throw new ServiceError('LIVRAISON_INTROUVABLE', 404);
  }
  verifierAcces(livraison, utilisateurCourant);
  if (livraison.statut !== STATUTS_LIVRAISON.ASSIGNEE) {
    throw new ServiceError('TRANSITION_INVALIDE', 409);
  }

  await livraisonsRepo.updateStatut(livraisonId, STATUTS_LIVRAISON.EN_COURS, null);
}

async function marquerLivree(livraisonId, utilisateurCourant) {
  const livraison = await livraisonsRepo.findById(livraisonId);
  if (!livraison) {
    throw new ServiceError('LIVRAISON_INTROUVABLE', 404);
  }
  verifierAcces(livraison, utilisateurCourant);
  if (livraison.statut === STATUTS_LIVRAISON.LIVREE) {
    throw new ServiceError('TRANSITION_INVALIDE', 409);
  }

  await livraisonsRepo.updateStatut(livraisonId, STATUTS_LIVRAISON.LIVREE, new Date());
  await commandesRepo.setStatut(livraison.commande_id, STATUTS_COMMANDE.LIVREE);
}

module.exports = {
  listCommandesAExpedier,
  listLivreurs,
  attribuerLivreur,
  listMesLivraisons,
  listToutesLivraisons,
  marquerEnCours,
  marquerLivree,
  STATUTS_LIVRAISON
};
