import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { isTokenBlacklisted } from "../controllers/authController.js";

export const verifyToken = (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization;

  // Check format FIRST before extracting token
  if (authHeader && !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid token format. Use 'Bearer <token>'" 
    });
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  try {
    // Check if token is blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ 
        success: false,
        message: "Token has been invalidated. Please log in again." 
      });
    }
    
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    return res.status(400).json({ 
      success: false,
      message: "Token is not valid",
      error: err.message
    });
  }
};

export const checkUserBlocked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Your account is blocked. Contact support." 
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Error verifying user status",
      error: err.message
    });
  }
};