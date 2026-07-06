const panierRepo = require('../repositories/panier.repo');
const produitsRepo = require('../repositories/produits.repo');
const commandesService = require('./commandes.service');
const { ServiceError } = require('./errors');

function computeTotal(items) {
  return items.reduce((total, item) => total + Number(item.prix) * item.quantite, 0);
}

async function getPanier(utilisateurId) {
  const items = await panierRepo.findByUtilisateur(utilisateurId);
  return { items, total: computeTotal(items) };
}

async function ajouterAuPanier(utilisateurId, produitId, quantite) {
  const produit = await produitsRepo.findById(produitId);
  if (!produit) {
    throw new ServiceError('PRODUIT_INTROUVABLE', 404);
  }
  await panierRepo.upsertItem(utilisateurId, produitId, Number(quantite) || 1);
}

async function modifierQuantite(utilisateurId, produitId, quantite) {
  if (Number(quantite) <= 0) {
    throw new ServiceError('QUANTITE_INVALIDE', 400);
  }
  const updated = await panierRepo.setQuantite(utilisateurId, produitId, Number(quantite));
  if (!updated) {
    throw new ServiceError('ARTICLE_INTROUVABLE', 404);
  }
}

async function retirerDuPanier(utilisateurId, produitId) {
  await panierRepo.removeItem(utilisateurId, produitId);
}

async function checkout(utilisateurId, telephone) {
  const items = await panierRepo.findByUtilisateur(utilisateurId);
  if (items.length === 0) {
    throw new ServiceError('PANIER_VIDE', 400);
  }

  const lignes = items.map((item) => ({
    produitId: item.produit_id,
    quantite: item.quantite,
    prixUnitaire: Number(item.prix)
  }));

  const result = await commandesService.createCommandeFromLignes(utilisateurId, { telephone, lignes });
  await panierRepo.clearForUtilisateur(utilisateurId);
  return result;
}

module.exports = { getPanier, ajouterAuPanier, modifierQuantite, retirerDuPanier, checkout };
