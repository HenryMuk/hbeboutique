const path = require('path');
const commandesService = require('../services/commandes.service');
const { STATUTS_COMMANDE } = require('../constants/commandeStatuts');

async function stream(req, res) {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const statutActuel = await commandesService.getStatut(id);
  if (statutActuel) {
    res.write(`data: ${JSON.stringify({ commandeId: id, statut: statutActuel })}\n\n`);
    if (statutActuel !== STATUTS_COMMANDE.EN_ATTENTE_PAIEMENT) {
      return res.end();
    }
  }

  const unsubscribe = commandesService.subscribe(id, res);

  req.on('close', () => {
    unsubscribe();
  });
}

async function mesCommandes(req, res, next) {
  try {
    const commandes = await commandesService.listMesCommandes(req.user.id);
    res.status(200).json(commandes);
  } catch (err) {
    next(err);
  }
}

async function telechargerFacture(req, res, next) {
  try {
    const facture = await commandesService.getFactureAutorisee(req.params.id, req.user);
    const filePath = path.join(__dirname, '../../uploads/factures', path.basename(facture.chemin_fichier));
    res.download(filePath, `${facture.numero}.pdf`);
  } catch (err) {
    next(err);
  }
}

module.exports = { stream, mesCommandes, telechargerFacture };
