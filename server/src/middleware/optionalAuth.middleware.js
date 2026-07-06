const jwtService = require('../services/jwt.service');

function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const bearerToken = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || req.query.token;

  if (token) {
    try {
      req.user = jwtService.verify(token);
    } catch (err) {
      req.user = null;
    }
  }

  next();
}

module.exports = optionalAuthMiddleware;
