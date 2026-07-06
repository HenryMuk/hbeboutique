const crypto = require('crypto');
const commandesRepo = require('../repositories/commandes.repo');

const subscribers = new Map();

function subscribe(commandeId, res) {
  if (!subscribers.has(commandeId)) {
    subscribers.set(commandeId, new Set());
  }
  subscribers.get(commandeId).add(res);
  return () => {
    const set = subscribers.get(commandeId);
    if (set) {
      set.delete(res);
      if (set.size === 0) subscribers.delete(commandeId);
    }
  };
}

function publish(commandeId, statut) {
  const set = subscribers.get(commandeId);
  if (!set) return;
  const payload = JSON.stringify({ commandeId, statut });
  const terminal = statut !== 'en_attente';
  for (const res of set) {
    res.write(`data: ${payload}\n\n`);
    if (terminal) res.end();
  }
  if (terminal) subscribers.delete(commandeId);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateConfirmation(commandeId) {
  const delay = 1500 + Math.round(Math.random() * 1000);
  await sleep(delay);
  await commandesRepo.setStatut(commandeId, 'reussie');
  publish(commandeId, 'reussie');
}

function generateReference() {
  return `HBE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

async function createCommandeFromLignes(utilisateurId, { telephone, lignes }) {
  const reference = generateReference();
  const montantTotal = lignes.reduce((total, ligne) => total + ligne.prixUnitaire * ligne.quantite, 0);

  const commandeId = await commandesRepo.createWithLignes({
    utilisateurId,
    telephone,
    reference,
    montantTotal,
    lignes
  });

  simulateConfirmation(commandeId).catch((err) => {
    console.error(`La simulation de confirmation pour la commande ${commandeId} a échoué:`, err.message);
  });

  return { commandeId, reference, statut: 'en_attente' };
}

async function getStatut(commandeId) {
  const commande = await commandesRepo.findById(commandeId);
  return commande ? commande.statut : null;
}

module.exports = { createCommandeFromLignes, subscribe, getStatut };
