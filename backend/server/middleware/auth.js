const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found or account deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Invalid authentication token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

// Optional authentication (for public routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-__v');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Guest authentication (for non-authenticated users)
const guestAuth = async (req, res, next) => {
  try {
    const isGuest = req.headers['x-guest-submission'] === 'true';
    
    if (isGuest) {
      // Create a guest user object without saving to database
      req.user = {
        _id: 'guest-' + Date.now(),
        email: req.headers['x-user-email'] || 'guest@codester.com',
        name: req.headers['x-user-name'] || 'Guest User',
        avatar: req.headers['x-user-avatar'] || '',
        role: 'guest',
        isActive: true,
        stats: {
          problemsSolved: 0,
          currentStreak: 0,
          totalSubmissions: 0,
          accuracy: 0
        }
      };
    } else {
      // Try to authenticate as regular user
      const authHeader = req.headers['authorization'];
      const appwriteToken = req.headers['x-appwrite-token'];
      
      if (authHeader || appwriteToken) {
        // Handle authenticated user
        const userData = {
          email: req.headers['x-user-email'] || 'user@example.com',
          name: req.headers['x-user-name'] || 'User',
          avatar: req.headers['x-user-avatar'] || ''
        };

        // Find or create user
        let user = await User.findOne({ email: userData.email });
        
        if (!user) {
          // Create user with a default password for OAuth users
          user = new User({
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            password: 'oauth-user-' + Date.now() // Temporary password for OAuth users
          });
          await user.save();
        }

        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Guest auth error:', error);
    // Continue without authentication
    next();
  }
};

// Admin authorization
const requireAdmin = (req, res, next) => {
  console.log('🔒 RequireAdmin check:', {
    hasUser: !!req.user,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    isAdmin: req.user?.role === 'admin'
  });

  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login to access this resource'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: `You do not have permission to access this resource. Your role: ${req.user.role}`
    });
  }

  next();
};

// Rate limiting helper
const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    validRequests.push(now);
    requests.set(key, validRequests);
    next();
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify Appwrite token (for integration with frontend)
const verifyAppwriteToken = async (req, res, next) => {
  try {
    const appwriteToken = req.headers['x-appwrite-token'];
    
    if (!appwriteToken) {
      return res.status(401).json({ 
        error: 'Appwrite token required',
        message: 'Please provide a valid Appwrite token'
      });
    }

    // Here you would verify the Appwrite token
    // For now, we'll create a user session based on the token
    const userData = {
      email: req.headers['x-user-email'] || 'user@example.com',
      name: req.headers['x-user-name'] || 'User',
      avatar: req.headers['x-user-avatar'] || ''
    };

    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        password: 'oauth-user-' + Date.now() // Temporary password for OAuth users
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Appwrite token verification error:', error);
    return res.status(401).json({ 
      error: 'Invalid Appwrite token',
      message: 'Authentication failed'
    });
  }
};

// Mock authentication for testing (remove in production)
const mockAuth = async (req, res, next) => {
  try {
    // For testing, accept any token that starts with 'mock'
    const authHeader = req.headers['authorization'];
    const appwriteToken = req.headers['x-appwrite-token'];
    
    if (!authHeader && !appwriteToken) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Create a mock user for testing
    const userData = {
      email: req.headers['x-user-email'] || 'test@example.com',
      name: req.headers['x-user-name'] || 'Test User',
      avatar: req.headers['x-user-avatar'] || ''
    };

    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar,
        password: 'mock-user-' + Date.now() // Temporary password for mock users
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Mock auth error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please try again'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  guestAuth,
  requireAdmin,
  createRateLimiter,
  generateToken,
  verifyAppwriteToken,
  mockAuth
}; 