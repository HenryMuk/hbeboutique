const pool = require('../db/pool');

async function findByUtilisateur(utilisateurId) {
  const [rows] = await pool.query(
    `SELECT pi.produit_id, pi.quantite, p.nom, p.description, p.prix, p.image_url, p.stock
     FROM panier_items pi
     JOIN produits p ON p.id = pi.produit_id
     WHERE pi.utilisateur_id = ?
     ORDER BY pi.created_at ASC`,
    [utilisateurId]
  );
  return rows;
}

async function upsertItem(utilisateurId, produitId, quantiteDelta) {
  await pool.query(
    `INSERT INTO panier_items (utilisateur_id, produit_id, quantite)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantite = quantite + VALUES(quantite)`,
    [utilisateurId, produitId, quantiteDelta]
  );
}

async function setQuantite(utilisateurId, produitId, quantite) {
  const [result] = await pool.query(
    'UPDATE panier_items SET quantite = ? WHERE utilisateur_id = ? AND produit_id = ?',
    [quantite, utilisateurId, produitId]
  );
  return result.affectedRows > 0;
}

async function removeItem(utilisateurId, produitId) {
  await pool.query('DELETE FROM panier_items WHERE utilisateur_id = ? AND produit_id = ?', [
    utilisateurId,
    produitId
  ]);
}

async function clearForUtilisateur(utilisateurId) {
  await pool.query('DELETE FROM panier_items WHERE utilisateur_id = ?', [utilisateurId]);
}

module.exports = { findByUtilisateur, upsertItem, setQuantite, removeItem, clearForUtilisateur };
