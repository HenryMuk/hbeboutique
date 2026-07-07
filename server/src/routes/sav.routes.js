const express = require('express');
const controller = require('../controllers/sav.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', controller.creer);
router.get('/mes-reclamations', controller.mesReclamations);

module.exports = router;
