const produitsRepo = require('../repositories/produits.repo');
const utilisateursRepo = require('../repositories/utilisateurs.repo');
const { ServiceError } = require('../services/errors');

async function listProduits(req, res, next) {
  try {
    const produits = await produitsRepo.findAll();
    res.status(200).json(produits);
  } catch (err) {
    next(err);
  }
}

async function createProduit(req, res, next) {
  try {
    const { nom, description, prix, imageUrl } = req.body;
    const id = await produitsRepo.create({ nom, description, prix, imageUrl });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

async function updateProduit(req, res, next) {
  try {
    const { nom, description, prix, imageUrl } = req.body;
    const updated = await produitsRepo.update(req.params.id, { nom, description, prix, imageUrl });
    if (!updated) {
      throw new ServiceError('PRODUIT_INTROUVABLE', 404);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function deleteProduit(req, res, next) {
  try {
    const removed = await produitsRepo.remove(req.params.id);
    if (!removed) {
      throw new ServiceError('PRODUIT_INTROUVABLE', 404);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function listUtilisateurs(req, res, next) {
  try {
    const utilisateurs = await utilisateursRepo.findAll();
    res.status(200).json(utilisateurs);
  } catch (err) {
    next(err);
  }
}

async function updateUtilisateur(req, res, next) {
  try {
    const { etat, role } = req.body;
    const updated = await utilisateursRepo.updateEtatRole(req.params.id, { etat, role });
    if (!updated) {
      throw new ServiceError('UTILISATEUR_INTROUVABLE', 404);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProduits,
  createProduit,
  updateProduit,
  deleteProduit,
  listUtilisateurs,
  updateUtilisateur
};
