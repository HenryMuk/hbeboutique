const express = require('express');
const controller = require('../controllers/commandes.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/mes-commandes', authMiddleware, controller.mesCommandes);
router.get('/:id/statut/stream', authMiddleware, controller.stream);
router.get('/:id/facture', authMiddleware, controller.telechargerFacture);

module.exports = router;
