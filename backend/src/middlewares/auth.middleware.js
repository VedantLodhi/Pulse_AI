// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  // Priority 1: Bearer Token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Priority 2: Cookie
  if (!token) {
    token = req.cookies?.token;
  }

  console.log(
    "AUTH HEADER RECEIVED:",
    req.headers.authorization
  );

  console.log(
    "COOKIE TOKEN:",
    req.cookies?.token
  );

  console.log(
    "FINAL TOKEN:",
    token
  );

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "DECODED JWT:",
      decoded
    );
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
