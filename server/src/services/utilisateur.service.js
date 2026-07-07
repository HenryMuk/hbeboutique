const bcrypt = require('bcryptjs');
const usersRepo = require('../repositories/utilisateurs.repo');
const mailerService = require('./mailer.service');
const jwtService = require('./jwt.service');
const { ServiceError } = require('./errors');

function generateOtp() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function otpExpiryDate() {
  return new Date(Date.now() + 15 * 60 * 1000);
}

function buildAuthPayload(user) {
  const token = jwtService.sign({ id: user.id, username: user.username, email: user.email, role: user.role });
  return { token, userId: user.id, username: user.username, role: user.role };
}

async function inscription({ email, username, password }) {
  if (await usersRepo.findByEmail(email)) {
    throw new ServiceError('EMAIL_EXISTS', 409);
  }
  if (await usersRepo.findByUsername(username)) {
    throw new ServiceError('USERNAME_EXISTS', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otpCode = generateOtp();
  const otpExpiry = otpExpiryDate();

  await usersRepo.create({ email, username, hashedPassword, otpCode, otpExpiry });

  try {
    await mailerService.sendOtpEmail(email, otpCode, username);
  } catch (err) {
    console.error(`Échec d'envoi de l'email OTP à ${email}:`, err.message);
  }
}

async function connexion({ email, password }) {
  const user = await usersRepo.findByEmail(email);
  if (!user) {
    throw new ServiceError('EMAIL_INEXISTANT', 404);
  }

  const passwordMatches = await bcrypt.compare(password, user.mdp);
  if (!passwordMatches) {
    throw new ServiceError('MDP_INVALIDE', 401);
  }

  if (user.etat === 'Banni') {
    throw new ServiceError('BANNI', 403);
  }
  if (user.etat === '' || user.etat === null) {
    throw new ServiceError('INACTIF', 403);
  }

  const payload = buildAuthPayload(user);
  await usersRepo.updateToken(user.id, payload.token);
  return payload;
}

async function verifierOtp({ email, code }) {
  const user = await usersRepo.findByEmailWithValidOtp(email, code);
  if (!user) {
    const expiredUser = await usersRepo.findByEmailWithExpiredOtp(email, code);
    if (expiredUser) {
      throw new ServiceError('CODE_EXPIRE', 410);
    }
    throw new ServiceError('CODE_INVALIDE', 400);
  }

  const payload = buildAuthPayload(user);
  await usersRepo.markVerified(user.id, payload.token);
  return payload;
}

async function renvoyerOtp({ email }) {
  const user = await usersRepo.findByEmail(email);
  if (!user) {
    throw new ServiceError('EMAIL_INEXISTANT', 404);
  }

  const otpCode = generateOtp();
  const otpExpiry = otpExpiryDate();
  await usersRepo.updateOtp(user.id, otpCode, otpExpiry);

  try {
    await mailerService.sendOtpEmail(email, otpCode, user.username);
  } catch (err) {
    console.error(`Échec d'envoi de l'email OTP à ${email}:`, err.message);
  }
}

async function getProfil(id) {
  const user = await usersRepo.findById(id);
  if (!user) {
    throw new ServiceError('UTILISATEUR_INTROUVABLE', 404);
  }
  const { mdp, otp_code, otp_expiry, token, ...profil } = user;
  return profil;
}

module.exports = { inscription, connexion, verifierOtp, renvoyerOtp, getProfil };
