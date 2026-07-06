const jwtService = require('../services/jwt.service');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const bearerToken = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || req.query.token;

  if (!token) {
    return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED' });
  }

  try {
    req.user = jwtService.verify(token);
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED' });
  }
}

module.exports = authMiddleware;
