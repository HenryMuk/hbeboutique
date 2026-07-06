const pool = require('../db/pool');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM produits ORDER BY id ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM produits WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ nom, description, prix, imageUrl }) {
  const [result] = await pool.query(
    'INSERT INTO produits (nom, description, prix, image_url) VALUES (?, ?, ?, ?)',
    [nom, description, prix, imageUrl]
  );
  return result.insertId;
}

async function update(id, { nom, description, prix, imageUrl }) {
  const [result] = await pool.query(
    'UPDATE produits SET nom = ?, description = ?, prix = ?, image_url = ? WHERE id = ?',
    [nom, description, prix, imageUrl, id]
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
  insertSignalement
};
