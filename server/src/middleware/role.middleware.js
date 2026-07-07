const { ROLES } = require('../constants/roles');

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const role = req.user && req.user.role;
    if (!role || (role !== ROLES.ADMIN && !allowedRoles.includes(role))) {
      return res.status(403).json({ status: 'error', code: 'FORBIDDEN' });
    }
    next();
  };
}

module.exports = { requireRole };
