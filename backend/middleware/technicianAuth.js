const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_TECHNICIAN || process.env.JWT_SECRET;

function verifyTechnicianJwt(req, res, next) {
  if (req.path === '/auth/login' && req.method === 'POST') {
    return next();
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT secret not configured' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.technician = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = verifyTechnicianJwt;
