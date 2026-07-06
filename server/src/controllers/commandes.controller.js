const commandesService = require('../services/commandes.service');

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
    if (statutActuel !== 'en_attente') {
      return res.end();
    }
  }

  const unsubscribe = commandesService.subscribe(id, res);

  req.on('close', () => {
    unsubscribe();
  });
}

module.exports = { stream };
