const { verifyToken } = require('./auth');

const jwtMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Access Denied' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to the request object
    next(); // Pass control to the next middleware/route
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = jwtMiddleware;
