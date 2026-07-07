const ticketsSavService = require('../services/ticketsSav.service');

async function creer(req, res, next) {
  try {
    const { commandeId, motif } = req.body;
    const result = await ticketsSavService.creerReclamation(req.user.id, commandeId, motif);
    res.status(201).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

async function mesReclamations(req, res, next) {
  try {
    const reclamations = await ticketsSavService.listMesReclamations(req.user.id);
    res.status(200).json(reclamations);
  } catch (err) {
    next(err);
  }
}

module.exports = { creer, mesReclamations };
