const pool = require('../db/pool');

async function createWithLignes({ utilisateurId, telephone, reference, montantTotal, lignes }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO commandes (utilisateur_id, telephone, reference, montant_total, statut)
       VALUES (?, ?, ?, ?, 'en_attente')`,
      [utilisateurId, telephone, reference, montantTotal]
    );
    const commandeId = result.insertId;

    const values = lignes.map((ligne) => [commandeId, ligne.produitId, ligne.quantite, ligne.prixUnitaire]);
    await connection.query(
      'INSERT INTO commande_lignes (commande_id, produit_id, quantite, prix_unitaire) VALUES ?',
      [values]
    );

    await connection.commit();
    return commandeId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function setStatut(id, statut) {
  await pool.query('UPDATE commandes SET statut = ? WHERE id = ?', [statut, id]);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM commandes WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findLignesByCommandeId(commandeId) {
  const [rows] = await pool.query(
    `SELECT cl.*, p.nom, p.image_url
     FROM commande_lignes cl
     JOIN produits p ON p.id = cl.produit_id
     WHERE cl.commande_id = ?`,
    [commandeId]
  );
  return rows;
}

module.exports = { createWithLignes, setStatut, findById, findLignesByCommandeId };
