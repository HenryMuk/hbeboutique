const pool = require('../db/pool');

async function create({ commandeId, utilisateurId, motif }) {
  const [result] = await pool.query(
    'INSERT INTO tickets_sav (commande_id, utilisateur_id, motif) VALUES (?, ?, ?)',
    [commandeId, utilisateurId, motif]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM tickets_sav WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByCommandeId(commandeId) {
  const [rows] = await pool.query('SELECT * FROM tickets_sav WHERE commande_id = ?', [commandeId]);
  return rows[0] || null;
}

async function findByUtilisateur(utilisateurId) {
  const [rows] = await pool.query(
    `SELECT t.*, c.reference
     FROM tickets_sav t
     JOIN commandes c ON c.id = t.commande_id
     WHERE t.utilisateur_id = ?
     ORDER BY t.created_at DESC`,
    [utilisateurId]
  );
  return rows;
}

async function findAllAvecDetails() {
  const [rows] = await pool.query(
    `SELECT t.id, t.motif, t.statut, t.resolution, t.created_at,
            c.id AS commande_id, c.reference, c.montant_total,
            u.username, u.email,
            l.statut AS livraison_statut, l.date_assignation, l.date_livraison,
            ul.username AS livreur_username
     FROM tickets_sav t
     JOIN commandes c ON c.id = t.commande_id
     JOIN utilisateurs u ON u.id = t.utilisateur_id
     LEFT JOIN livraisons l ON l.commande_id = c.id
     LEFT JOIN utilisateurs ul ON ul.id = l.livreur_id
     ORDER BY t.created_at DESC`
  );
  return rows;
}

async function updateStatut(id, statut, resolution) {
  const [result] = await pool.query('UPDATE tickets_sav SET statut = ?, resolution = ? WHERE id = ?', [
    statut,
    resolution,
    id
  ]);
  return result.affectedRows > 0;
}

module.exports = { create, findById, findByCommandeId, findByUtilisateur, findAllAvecDetails, updateStatut };
