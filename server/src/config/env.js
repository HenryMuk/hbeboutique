require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value && value !== '') {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

module.exports = {
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  db: {
    host: required('DB_HOST'),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME')
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  smtp: {
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT) || 587,
    user: required('SMTP_USER'),
    pass: required('SMTP_PASS')
  }
};
