const pool = require('../db/pool');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM produits ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM produits WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ nom, description, prix, imageUrl, stock }) {
  const [result] = await pool.query(
    'INSERT INTO produits (nom, description, prix, image_url, stock) VALUES (?, ?, ?, ?, ?)',
    [nom, description, prix, imageUrl, stock]
  );
  return result.insertId;
}

async function update(id, { nom, description, prix, imageUrl, stock }) {
  const [result] = await pool.query(
    'UPDATE produits SET nom = ?, description = ?, prix = ?, image_url = ?, stock = ? WHERE id = ?',
    [nom, description, prix, imageUrl, stock, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM produits WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function countLikes(produitId) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM produit_likes WHERE produit_id = ?', [produitId]);
  return rows[0].total;
}

async function isLikedBy(produitId, utilisateurId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM produit_likes WHERE produit_id = ? AND utilisateur_id = ?',
    [produitId, utilisateurId]
  );
  return rows.length > 0;
}

async function insertLike(produitId, utilisateurId) {
  await pool.query('INSERT INTO produit_likes (produit_id, utilisateur_id) VALUES (?, ?)', [
    produitId,
    utilisateurId
  ]);
}

async function deleteLike(produitId, utilisateurId) {
  await pool.query('DELETE FROM produit_likes WHERE produit_id = ? AND utilisateur_id = ?', [
    produitId,
    utilisateurId
  ]);
}

async function insertSignalement(produitId, utilisateurId, motif) {
  await pool.query('INSERT INTO signalements (produit_id, utilisateur_id, motif) VALUES (?, ?, ?)', [
    produitId,
    utilisateurId,
    motif
  ]);
}

async function findAllSignalements() {
  const [rows] = await pool.query(
    `SELECT s.id, s.motif, s.statut, s.created_at, p.id AS produit_id, p.nom AS produit_nom,
            u.username, u.email
     FROM signalements s
     JOIN produits p ON p.id = s.produit_id
     JOIN utilisateurs u ON u.id = s.utilisateur_id
     ORDER BY s.created_at DESC`
  );
  return rows;
}

async function updateStatutSignalement(id, statut) {
  const [result] = await pool.query('UPDATE signalements SET statut = ? WHERE id = ?', [statut, id]);
  return result.affectedRows > 0;
}

async function deleteSignalement(id) {
  const [result] = await pool.query('DELETE FROM signalements WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  countLikes,
  isLikedBy,
  insertLike,
  deleteLike,
  insertSignalement,
  findAllSignalements,
  updateStatutSignalement,
  deleteSignalement
};
