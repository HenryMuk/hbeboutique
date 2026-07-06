const express = require('express');
const controller = require('../controllers/produits.controller');
const authMiddleware = require('../middleware/auth.middleware');
const optionalAuthMiddleware = require('../middleware/optionalAuth.middleware');

const router = express.Router();

router.get('/', controller.findAll);
router.get('/:id', optionalAuthMiddleware, controller.findById);
router.post('/:id/like', authMiddleware, controller.toggleLike);
router.post('/:id/signaler', authMiddleware, controller.signaler);

module.exports = router;
