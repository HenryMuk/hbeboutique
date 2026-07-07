const pool = require('../db/pool');

async function create({ commandeId, numero, montantTotal, cheminFichier }) {
  const [result] = await pool.query(
    'INSERT INTO factures (commande_id, numero, montant_total, chemin_fichier) VALUES (?, ?, ?, ?)',
    [commandeId, numero, montantTotal, cheminFichier]
  );
  return result.insertId;
}

async function findByCommandeId(commandeId) {
  const [rows] = await pool.query('SELECT * FROM factures WHERE commande_id = ?', [commandeId]);
  return rows[0] || null;
}

async function findAllAvecCommande() {
  const [rows] = await pool.query(
    `SELECT f.id, f.numero, f.montant_total, f.chemin_fichier, f.created_at,
            c.id AS commande_id, c.reference, c.statut AS commande_statut,
            u.username, u.email
     FROM factures f
     JOIN commandes c ON c.id = f.commande_id
     JOIN utilisateurs u ON u.id = c.utilisateur_id
     ORDER BY f.created_at DESC`
  );
  return rows;
}

module.exports = { create, findByCommandeId, findAllAvecCommande };
