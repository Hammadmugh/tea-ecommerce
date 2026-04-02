import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

// Helper function to generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Check if token is blacklisted
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// @route POST /api/auth/signup
// @access Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user (default role is "user")
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isBlocked: false
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error during signup",
      error: err.message
    });
  }
};

// @route POST /api/auth/login
// @access Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('🔍 User found:', !!user);
    if (user) {
      console.log('📋 User role:', user.role, '| Blocked:', user.isBlocked);
    }
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        message: "Your account is blocked. Contact support." 
      });
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = generateToken(user);
    console.log('🎟️ Token generated');

    const responseData = {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    console.log('📤 Sending login response with user role:', responseData.user.role);

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: err.message
    });
  }
};

// @route GET /api/auth/profile
// @access Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: err.message
    });
  }
};

// @route POST /api/auth/logout
// @access Private
export const logout = (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      // Add token to blacklist
      tokenBlacklist.add(token);
      console.log('🔐 Token added to blacklist on logout');
    }
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: err.message
    });
  }
};
