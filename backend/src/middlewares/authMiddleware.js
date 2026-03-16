import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyToken = (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token, authorization denied" 
    });
  }

  if (authHeader && !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid token format. Use 'Bearer <token>'" 
    });
  }

  try {
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