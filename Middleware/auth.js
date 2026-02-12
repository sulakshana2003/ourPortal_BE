import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Handle legacy tokens missing portalCode
    if (!req.user.portalCode) {
      const user = await User.findById(req.user.id).select("portalCode");
      if (user) req.user.portalCode = user.portalCode;
    }

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (!req.user.portalCode) {
      const user = await User.findById(req.user.id).select("portalCode");
      if (user) req.user.portalCode = user.portalCode;
    }
  } catch {}
  return next();
};
