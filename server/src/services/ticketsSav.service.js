const ticketsSavRepo = require('../repositories/ticketsSav.repo');
const commandesRepo = require('../repositories/commandes.repo');
const { ServiceError } = require('./errors');
const { STATUTS_COMMANDE } = require('../constants/commandeStatuts');

const STATUTS_TICKET = { OUVERT: 'ouvert', EN_COURS: 'en_cours', RESOLU: 'resolu' };

async function creerReclamation(utilisateurId, commandeId, motif) {
  if (!motif || !motif.trim()) {
    throw new ServiceError('MOTIF_REQUIS', 400);
  }

  const commande = await commandesRepo.findById(commandeId);
  if (!commande) {
    throw new ServiceError('COMMANDE_INTROUVABLE', 404);
  }
  if (commande.utilisateur_id !== utilisateurId) {
    throw new ServiceError('FORBIDDEN', 403);
  }
  if (commande.statut !== STATUTS_COMMANDE.LIVREE) {
    throw new ServiceError('COMMANDE_NON_LIVREE', 409);
  }

  const existant = await ticketsSavRepo.findByCommandeId(commandeId);
  if (existant) {
    throw new ServiceError('RECLAMATION_DEJA_OUVERTE', 409);
  }

  const id = await ticketsSavRepo.create({ commandeId, utilisateurId, motif: motif.trim() });
  return { id };
}

async function listMesReclamations(utilisateurId) {
  return ticketsSavRepo.findByUtilisateur(utilisateurId);
}

async function listToutesReclamations() {
  return ticketsSavRepo.findAllAvecDetails();
}

async function traiterReclamation(ticketId, statut, resolution) {
  if (![STATUTS_TICKET.EN_COURS, STATUTS_TICKET.RESOLU].includes(statut)) {
    throw new ServiceError('STATUT_INVALIDE', 400);
  }

  const ticket = await ticketsSavRepo.findById(ticketId);
  if (!ticket) {
    throw new ServiceError('RECLAMATION_INTROUVABLE', 404);
  }

  await ticketsSavRepo.updateStatut(ticketId, statut, resolution || null);
}

module.exports = {
  creerReclamation,
  listMesReclamations,
  listToutesReclamations,
  traiterReclamation,
  STATUTS_TICKET
};
