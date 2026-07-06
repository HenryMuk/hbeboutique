const express = require('express');
const controller = require('../controllers/panier.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', controller.list);
router.post('/', controller.add);
router.post('/checkout', controller.checkout);
router.patch('/:produitId', controller.updateQuantite);
router.delete('/:produitId', controller.remove);

module.exports = router;
