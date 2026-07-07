const express = require('express');
const controller = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadProduitImage } = require('../middleware/upload.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware);

router.get('/produits', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.listProduits);
router.post(
  '/produits',
  requireRole(ROLES.GESTIONNAIRE_BOUTIQUE),
  uploadProduitImage.single('image'),
  controller.createProduit
);
router.put(
  '/produits/:id',
  requireRole(ROLES.GESTIONNAIRE_BOUTIQUE),
  uploadProduitImage.single('image'),
  controller.updateProduit
);
router.delete('/produits/:id', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.deleteProduit);

router.get('/utilisateurs', requireRole(ROLES.ADMIN), controller.listUtilisateurs);
router.patch('/utilisateurs/:id', requireRole(ROLES.ADMIN), controller.updateUtilisateur);

router.get('/signalements', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.listSignalements);
router.patch('/signalements/:id', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.updateStatutSignalement);
router.delete('/signalements/:id', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.deleteSignalement);

router.get('/commandes', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.listCommandesEnAttente);
router.patch('/commandes/:id/valider', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.validerCommande);
router.patch('/commandes/:id/rejeter', requireRole(ROLES.GESTIONNAIRE_BOUTIQUE), controller.rejeterCommande);

router.get('/paiements', requireRole(ROLES.CAISSIER), controller.listPaiements);

module.exports = router;
