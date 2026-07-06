const pool = require('../db/pool');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE username = ?', [username]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ email, username, hashedPassword, otpCode, otpExpiry }) {
  const [result] = await pool.query(
    `INSERT INTO utilisateurs (email, username, mdp, otp_code, otp_expiry, etat, date)
     VALUES (?, ?, ?, ?, ?, 'Actif', NOW())`,
    [email, username, hashedPassword, otpCode, otpExpiry]
  );
  return result.insertId;
}

async function updateToken(id, token) {
  await pool.query('UPDATE utilisateurs SET token = ? WHERE id = ?', [token, id]);
}

async function updateOtp(id, otpCode, otpExpiry) {
  await pool.query('UPDATE utilisateurs SET otp_code = ?, otp_expiry = ? WHERE id = ?', [otpCode, otpExpiry, id]);
}

async function markVerified(id, token) {
  await pool.query(
    `UPDATE utilisateurs SET token = ?, otp_code = NULL, otp_expiry = NULL, email_verifie = 1 WHERE id = ?`,
    [token, id]
  );
}

async function findByEmailWithValidOtp(email, code) {
  const [rows] = await pool.query(
    'SELECT * FROM utilisateurs WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()',
    [email, code]
  );
  return rows[0] || null;
}

async function findByEmailWithExpiredOtp(email, code) {
  const [rows] = await pool.query(
    'SELECT * FROM utilisateurs WHERE email = ? AND otp_code = ? AND otp_expiry <= NOW()',
    [email, code]
  );
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, email, username, etat, role, email_verifie, date FROM utilisateurs ORDER BY id ASC'
  );
  return rows;
}

async function updateEtatRole(id, { etat, role }) {
  const champs = [];
  const valeurs = [];

  if (etat !== undefined) {
    champs.push('etat = ?');
    valeurs.push(etat);
  }
  if (role !== undefined) {
    champs.push('role = ?');
    valeurs.push(role);
  }

  if (champs.length === 0) return false;

  valeurs.push(id);
  const [result] = await pool.query(`UPDATE utilisateurs SET ${champs.join(', ')} WHERE id = ?`, valeurs);
  return result.affectedRows > 0;
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  create,
  updateToken,
  updateOtp,
  markVerified,
  findByEmailWithValidOtp,
  findByEmailWithExpiredOtp,
  findAll,
  updateEtatRole
};
