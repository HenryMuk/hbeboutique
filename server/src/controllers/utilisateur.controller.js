const utilisateurService = require('../services/utilisateur.service');

async function inscription(req, res, next) {
  try {
    const { email, username, password } = req.body;
    await utilisateurService.inscription({ email, username, password });
    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function connexion(req, res, next) {
  try {
    const { email, password } = req.body;
    const payload = await utilisateurService.connexion({ email, password });
    res.status(200).json({ status: 'success', ...payload });
  } catch (err) {
    next(err);
  }
}

async function verifierOtp(req, res, next) {
  try {
    const { email, code } = req.body;
    const payload = await utilisateurService.verifierOtp({ email, code });
    res.status(200).json({ status: 'success', ...payload });
  } catch (err) {
    next(err);
  }
}

async function renvoyerOtp(req, res, next) {
  try {
    const { email } = req.body;
    await utilisateurService.renvoyerOtp({ email });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
}

async function moi(req, res, next) {
  try {
    const profil = await utilisateurService.getProfil(req.user.id);
    res.status(200).json(profil);
  } catch (err) {
    next(err);
  }
}

module.exports = { inscription, connexion, verifierOtp, renvoyerOtp, moi };
