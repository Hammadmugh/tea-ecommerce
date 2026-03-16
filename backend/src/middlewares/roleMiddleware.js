// Role-based authorization middleware
// Used to restrict access to specific roles

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
      });
    }

    next();
  };
};

// Specific role checks
export const isSuperAdmin = authorize("superadmin");
export const isAdmin = authorize("superadmin", "admin");
export const isUser = authorize("superadmin", "admin", "user");

// Ownership check - ensure user can only access their own data
export const checkOwnership = (req, res, next) => {
  // req.params.userId should be compared with req.user.id
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.id !== resourceUserId && req.user.role !== "superadmin") {
    return res.status(403).json({ 
      success: false,
      message: "You can only access your own data" 
    });
  }

  next();
};
