function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ status: 'error', code: 'FORBIDDEN' });
  }
  next();
}

module.exports = adminMiddleware;
