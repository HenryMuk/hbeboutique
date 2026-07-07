const pool = require('../db/pool');

async function create(commandeId, livreurId) {
  const [result] = await pool.query(
    'INSERT INTO livraisons (commande_id, livreur_id, statut) VALUES (?, ?, ?)',
    [commandeId, livreurId, 'assignee']
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM livraisons WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByCommandeId(commandeId) {
  const [rows] = await pool.query('SELECT * FROM livraisons WHERE commande_id = ?', [commandeId]);
  return rows[0] || null;
}

async function findValideesSansLivraison() {
  const [rows] = await pool.query(
    `SELECT c.id, c.reference, c.montant_total, c.created_at, u.username, u.email
     FROM commandes c
     JOIN utilisateurs u ON u.id = c.utilisateur_id
     LEFT JOIN livraisons l ON l.commande_id = c.id
     WHERE c.statut = 'validee' AND l.id IS NULL
     ORDER BY c.created_at ASC`
  );
  return rows;
}

async function findByLivreur(livreurId) {
  const [rows] = await pool.query(
    `SELECT l.id, l.statut, l.date_assignation, l.date_livraison,
            c.id AS commande_id, c.reference, c.montant_total, c.telephone,
            u.username AS client_username
     FROM livraisons l
     JOIN commandes c ON c.id = l.commande_id
     JOIN utilisateurs u ON u.id = c.utilisateur_id
     WHERE l.livreur_id = ?
     ORDER BY l.date_assignation DESC`,
    [livreurId]
  );
  return rows;
}

async function findAllAvecDetails() {
  const [rows] = await pool.query(
    `SELECT l.id, l.statut, l.date_assignation, l.date_livraison,
            c.id AS commande_id, c.reference, c.montant_total,
            uc.username AS client_username,
            ul.username AS livreur_username
     FROM livraisons l
     JOIN commandes c ON c.id = l.commande_id
     JOIN utilisateurs uc ON uc.id = c.utilisateur_id
     JOIN utilisateurs ul ON ul.id = l.livreur_id
     ORDER BY l.date_assignation DESC`
  );
  return rows;
}

async function updateStatut(id, statut, dateLivraison) {
  const [result] = await pool.query('UPDATE livraisons SET statut = ?, date_livraison = ? WHERE id = ?', [
    statut,
    dateLivraison,
    id
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  create,
  findById,
  findByCommandeId,
  findValideesSansLivraison,
  findByLivreur,
  findAllAvecDetails,
  updateStatut
};
