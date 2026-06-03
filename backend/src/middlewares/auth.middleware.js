// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  console.log("=== AUTH DEBUG ===");
  console.log("Cookies:", req.cookies);
  console.log("Token:", req.cookies?.token);
  const token = req.cookies?.token;  // Get JWT from cookies
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    const userId = decoded.id || decoded.userId;
    console.log("Resolved User ID:", userId);
    req.user = userId;
    req.userId = userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};

export default verifyToken;
