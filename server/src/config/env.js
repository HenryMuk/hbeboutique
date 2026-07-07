require('dotenv').config();

// Sur certaines machines (antivirus/VPN avec proxy DNS local), le résolveur
// DNS de Node est configuré sur 127.0.0.1 et time out sur les requêtes
// externes (SMTP, APIs tierces) alors que le résolveur du système fonctionne.
// On bascule vers des DNS publics fiables uniquement dans ce cas précis.
// `dns.setServers()` seul ne suffit pas : certaines libs (ex. nodemailer)
// créent leurs propres instances `new dns.Resolver()`, qui relisent la
// config DNS système au lieu d'hériter du défaut global — on patche donc
// aussi la classe `Resolver` pour que toute nouvelle instance en hérite.
const dns = require('dns');
if (dns.getServers().every((server) => server.startsWith('127.'))) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  const OriginalResolver = dns.Resolver;
  class PatchedResolver extends OriginalResolver {
    constructor(...args) {
      super(...args);
      this.setServers(['8.8.8.8', '1.1.1.1']);
    }
  }
  dns.Resolver = PatchedResolver;
}

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
