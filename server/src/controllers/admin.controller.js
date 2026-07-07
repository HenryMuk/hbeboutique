const produitsRepo = require('../repositories/produits.repo');
const utilisateursRepo = require('../repositories/utilisateurs.repo');
const commandesService = require('../services/commandes.service');
const livraisonsService = require('../services/livraisons.service');
const ticketsSavService = require('../services/ticketsSav.service');
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

async function listCommandesEnAttente(req, res, next) {
  try {
    const commandes = await commandesService.listEnAttenteValidation();
    res.status(200).json(commandes);
  } catch (err) {
    next(err);
  }
}

async function validerCommande(req, res, next) {
  try {
    const facture = await commandesService.validerCommande(req.params.id);
    res.status(200).json({ status: 'success', facture });
  } catch (err) {
    next(err);
  }
}

async function rejeterCommande(req, res, next) {
  try {
    await commandesService.rejeterCommande(req.params.id);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function listPaiements(req, res, next) {
  try {
    const paiements = await commandesService.listPaiements();
    res.status(200).json(paiements);
  } catch (err) {
    next(err);
  }
}

async function listCommandesAExpedier(req, res, next) {
  try {
    const commandes = await livraisonsService.listCommandesAExpedier();
    res.status(200).json(commandes);
  } catch (err) {
    next(err);
  }
}

async function listLivreurs(req, res, next) {
  try {
    const livreurs = await livraisonsService.listLivreurs();
    res.status(200).json(livreurs);
  } catch (err) {
    next(err);
  }
}

async function attribuerLivreur(req, res, next) {
  try {
    const { commandeId, livreurId } = req.body;
    const result = await livraisonsService.attribuerLivreur(commandeId, livreurId);
    res.status(201).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

async function listToutesLivraisons(req, res, next) {
  try {
    const livraisons = await livraisonsService.listToutesLivraisons();
    res.status(200).json(livraisons);
  } catch (err) {
    next(err);
  }
}

async function listMesLivraisons(req, res, next) {
  try {
    const livraisons = await livraisonsService.listMesLivraisons(req.user.id);
    res.status(200).json(livraisons);
  } catch (err) {
    next(err);
  }
}

async function marquerLivraisonEnCours(req, res, next) {
  try {
    await livraisonsService.marquerEnCours(req.params.id, req.user);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function marquerLivraisonLivree(req, res, next) {
  try {
    await livraisonsService.marquerLivree(req.params.id, req.user);
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function listReclamations(req, res, next) {
  try {
    const reclamations = await ticketsSavService.listToutesReclamations();
    res.status(200).json(reclamations);
  } catch (err) {
    next(err);
  }
}

async function traiterReclamation(req, res, next) {
  try {
    const { statut, resolution } = req.body;
    await ticketsSavService.traiterReclamation(req.params.id, statut, resolution);
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
  deleteSignalement,
  listCommandesEnAttente,
  validerCommande,
  rejeterCommande,
  listPaiements,
  listCommandesAExpedier,
  listLivreurs,
  attribuerLivreur,
  listToutesLivraisons,
  listMesLivraisons,
  marquerLivraisonEnCours,
  marquerLivraisonLivree,
  listReclamations,
  traiterReclamation
};
