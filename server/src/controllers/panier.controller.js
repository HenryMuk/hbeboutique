const panierService = require('../services/panier.service');

async function list(req, res, next) {
  try {
    const panier = await panierService.getPanier(req.user.id);
    res.status(200).json(panier);
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const { produitId, quantite } = req.body;
    await panierService.ajouterAuPanier(req.user.id, produitId, quantite);
    const panier = await panierService.getPanier(req.user.id);
    res.status(201).json(panier);
  } catch (err) {
    next(err);
  }
}

async function updateQuantite(req, res, next) {
  try {
    const { produitId } = req.params;
    const { quantite } = req.body;
    await panierService.modifierQuantite(req.user.id, produitId, quantite);
    const panier = await panierService.getPanier(req.user.id);
    res.status(200).json(panier);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { produitId } = req.params;
    await panierService.retirerDuPanier(req.user.id, produitId);
    const panier = await panierService.getPanier(req.user.id);
    res.status(200).json(panier);
  } catch (err) {
    next(err);
  }
}

async function checkout(req, res, next) {
  try {
    const { telephone } = req.body;
    const result = await panierService.checkout(req.user.id, telephone);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, add, updateQuantite, remove, checkout };
