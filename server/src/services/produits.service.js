const produitsRepo = require('../repositories/produits.repo');
const { ServiceError } = require('./errors');

async function findAll() {
  return produitsRepo.findAll();
}

async function findById(id, currentUserId) {
  const produit = await produitsRepo.findById(id);
  if (!produit) {
    throw new ServiceError('PRODUIT_INTROUVABLE', 404);
  }

  const likesCount = await produitsRepo.countLikes(id);
  const estLikePar = currentUserId ? await produitsRepo.isLikedBy(id, currentUserId) : false;

  return { ...produit, likesCount, estLikePar };
}

async function toggleLike(produitId, utilisateurId) {
  const produit = await produitsRepo.findById(produitId);
  if (!produit) {
    throw new ServiceError('PRODUIT_INTROUVABLE', 404);
  }

  const dejaLike = await produitsRepo.isLikedBy(produitId, utilisateurId);
  if (dejaLike) {
    await produitsRepo.deleteLike(produitId, utilisateurId);
  } else {
    await produitsRepo.insertLike(produitId, utilisateurId);
  }

  const likesCount = await produitsRepo.countLikes(produitId);
  return { liked: !dejaLike, likesCount };
}

async function signaler(produitId, utilisateurId, motif) {
  if (!motif || !motif.trim()) {
    throw new ServiceError('MOTIF_REQUIS', 400);
  }

  const produit = await produitsRepo.findById(produitId);
  if (!produit) {
    throw new ServiceError('PRODUIT_INTROUVABLE', 404);
  }

  await produitsRepo.insertSignalement(produitId, utilisateurId, motif.trim());
}

module.exports = { findAll, findById, toggleLike, signaler };
