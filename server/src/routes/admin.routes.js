const express = require('express');
const controller = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/produits', controller.listProduits);
router.post('/produits', controller.createProduit);
router.put('/produits/:id', controller.updateProduit);
router.delete('/produits/:id', controller.deleteProduit);

router.get('/utilisateurs', controller.listUtilisateurs);
router.patch('/utilisateurs/:id', controller.updateUtilisateur);

router.get('/signalements', controller.listSignalements);
router.delete('/signalements/:id', controller.deleteSignalement);

module.exports = router;
