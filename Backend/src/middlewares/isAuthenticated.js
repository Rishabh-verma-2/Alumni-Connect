import jwt from "jsonwebtoken";

export async function isAuthenticated (req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Access token is required' 
    });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid token format' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.log('JWT verification failed:', error.message);
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid or expired token' 
    });
  }
};