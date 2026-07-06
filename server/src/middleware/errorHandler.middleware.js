const { ServiceError } = require('../services/errors');

function errorHandler(err, req, res, next) {
  if (err instanceof ServiceError) {
    return res.status(err.status).json({ status: 'error', code: err.code });
  }

  console.error(err);
  return res.status(500).json({ status: 'error', code: 'ERREUR_SERVEUR' });
}

module.exports = errorHandler;
