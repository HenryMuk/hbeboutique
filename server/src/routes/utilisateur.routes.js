const express = require('express');
const controller = require('../controllers/utilisateur.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/inscription', controller.inscription);
router.post('/connexion', controller.connexion);
router.post('/verifier-otp', controller.verifierOtp);
router.post('/renvoyer-otp', controller.renvoyerOtp);
router.get('/moi', authMiddleware, controller.moi);

module.exports = router;
