const express = require('express');
const controller = require('../controllers/commandes.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:id/statut/stream', authMiddleware, controller.stream);

module.exports = router;
