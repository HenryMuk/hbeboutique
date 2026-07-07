const pool = require('../db/pool');
const { STATUTS_COMMANDE } = require('../constants/commandeStatuts');

async function createWithLignes({ utilisateurId, telephone, reference, montantTotal, lignes }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO commandes (utilisateur_id, telephone, reference, montant_total, statut)
       VALUES (?, ?, ?, ?, ?)`,
      [utilisateurId, telephone, reference, montantTotal, STATUTS_COMMANDE.EN_ATTENTE_PAIEMENT]
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

// Décrémente le stock de chaque ligne et fait passer la commande au statut donné,
// dans une seule transaction : si une ligne dépasse le stock disponible, tout est annulé.
async function validerAvecDecrementStock(commandeId, lignes, nouveauStatut) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const ligne of lignes) {
      const [result] = await connection.query(
        'UPDATE produits SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [ligne.quantite, ligne.produit_id, ligne.quantite]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }
    }

    await connection.query('UPDATE commandes SET statut = ? WHERE id = ?', [nouveauStatut, commandeId]);
    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function findEnAttenteValidation() {
  const [rows] = await pool.query(
    `SELECT c.id, c.reference, c.montant_total, c.statut, c.telephone, c.created_at, u.username, u.email
     FROM commandes c
     JOIN utilisateurs u ON u.id = c.utilisateur_id
     WHERE c.statut = ?
     ORDER BY c.created_at ASC`,
    [STATUTS_COMMANDE.EN_ATTENTE_VALIDATION]
  );
  return rows;
}

async function findByUtilisateur(utilisateurId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.reference, c.montant_total, c.statut, c.created_at,
            f.id AS facture_id, f.numero AS facture_numero
     FROM commandes c
     LEFT JOIN factures f ON f.commande_id = c.id
     WHERE c.utilisateur_id = ?
     ORDER BY c.created_at DESC`,
    [utilisateurId]
  );
  return rows;
}

async function findHistoriquePaiements() {
  const [rows] = await pool.query(
    `SELECT c.id, c.reference, c.montant_total, c.statut, c.created_at, u.username, u.email,
            f.id AS facture_id, f.numero AS facture_numero
     FROM commandes c
     JOIN utilisateurs u ON u.id = c.utilisateur_id
     LEFT JOIN factures f ON f.commande_id = c.id
     WHERE c.statut IN (?, ?)
     ORDER BY c.created_at DESC`,
    [STATUTS_COMMANDE.VALIDEE, STATUTS_COMMANDE.REJETEE]
  );
  return rows;
}

module.exports = {
  createWithLignes,
  setStatut,
  findById,
  findLignesByCommandeId,
  validerAvecDecrementStock,
  findEnAttenteValidation,
  findByUtilisateur,
  findHistoriquePaiements
};
