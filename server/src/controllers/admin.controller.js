const produitsRepo = require('../repositories/produits.repo');
const utilisateursRepo = require('../repositories/utilisateurs.repo');
const { ServiceError } = require('../services/errors');
const { ROLES_LIST } = require('../constants/roles');

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
    const { nom, description, prix, stock } = req.body;
    if (!req.file) {
      throw new ServiceError('IMAGE_REQUISE', 400);
    }
    const imageUrl = `/uploads/produits/${req.file.filename}`;
    const id = await produitsRepo.create({ nom, description, prix, imageUrl, stock: Number(stock) || 0 });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

async function updateProduit(req, res, next) {
  try {
    const { nom, description, prix, stock } = req.body;
    const existant = await produitsRepo.findById(req.params.id);
    if (!existant) {
      throw new ServiceError('PRODUIT_INTROUVABLE', 404);
    }
    const imageUrl = req.file ? `/uploads/produits/${req.file.filename}` : existant.image_url;
    const updated = await produitsRepo.update(req.params.id, {
      nom,
      description,
      prix,
      imageUrl,
      stock: Number(stock) || 0
    });
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
    if (role !== undefined && !ROLES_LIST.includes(role)) {
      throw new ServiceError('ROLE_INVALIDE', 400);
    }
    const updated = await utilisateursRepo.updateEtatRole(req.params.id, { etat, role });
    if (!updated) {
      throw new ServiceError('UTILISATEUR_INTROUVABLE', 404);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function listSignalements(req, res, next) {
  try {
    const signalements = await produitsRepo.findAllSignalements();
    res.status(200).json(signalements);
  } catch (err) {
    next(err);
  }
}

async function updateStatutSignalement(req, res, next) {
  try {
    const { statut } = req.body;
    if (!['nouveau', 'traite'].includes(statut)) {
      throw new ServiceError('STATUT_INVALIDE', 400);
    }
    const updated = await produitsRepo.updateStatutSignalement(req.params.id, statut);
    if (!updated) {
      throw new ServiceError('SIGNALEMENT_INTROUVABLE', 404);
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function deleteSignalement(req, res, next) {
  try {
    const removed = await produitsRepo.deleteSignalement(req.params.id);
    if (!removed) {
      throw new ServiceError('SIGNALEMENT_INTROUVABLE', 404);
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
  updateUtilisateur,
  listSignalements,
  updateStatutSignalement,
  deleteSignalement
};
