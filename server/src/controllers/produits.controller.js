const produitsService = require('../services/produits.service');

async function findAll(req, res, next) {
  try {
    const produits = await produitsService.findAll();
    res.status(200).json(produits);
  } catch (err) {
    next(err);
  }
}

async function findById(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const produit = await produitsService.findById(req.params.id, currentUserId);
    res.status(200).json(produit);
  } catch (err) {
    next(err);
  }
}

async function toggleLike(req, res, next) {
  try {
    const result = await produitsService.toggleLike(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function signaler(req, res, next) {
  try {
    await produitsService.signaler(req.params.id, req.user.id, req.body.motif);
    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

module.exports = { findAll, findById, toggleLike, signaler };
