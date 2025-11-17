const jwt = require('jsonwebtoken');

// JWT Secret with fallback for local development
const JWT_SECRET = process.env.JWT_SECRET || 'skillera-local-dev-secret-change-in-production';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;

