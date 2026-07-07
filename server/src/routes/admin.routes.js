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

router.get('/livraisons/a-expedier', requireRole(ROLES.ENTREPOT), controller.listCommandesAExpedier);
router.get('/livraisons/livreurs', requireRole(ROLES.ENTREPOT), controller.listLivreurs);
router.post('/livraisons', requireRole(ROLES.ENTREPOT), controller.attribuerLivreur);
router.get('/livraisons', requireRole(ROLES.ENTREPOT, ROLES.GESTIONNAIRE_BOUTIQUE), controller.listToutesLivraisons);
router.get('/livraisons/mes-livraisons', requireRole(ROLES.LIVRAISON), controller.listMesLivraisons);
router.patch('/livraisons/:id/en-cours', requireRole(ROLES.LIVRAISON), controller.marquerLivraisonEnCours);
router.patch('/livraisons/:id/livree', requireRole(ROLES.LIVRAISON), controller.marquerLivraisonLivree);

router.get('/sav', requireRole(ROLES.SAV), controller.listReclamations);
router.patch('/sav/:id', requireRole(ROLES.SAV), controller.traiterReclamation);

module.exports = router;
