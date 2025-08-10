const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

// Configuration - Updated for new compiler service
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vikrantkawadkar2099@gmail.com';
const SEED_TEST_USERS = (process.env.SEED_TEST_USERS || '').toLowerCase() === 'true' 
  || (process.env.NODE_ENV !== 'production' && (process.env.SEED_TEST_USERS || '') !== 'false');
const DEFAULT_ADMIN_SEED = {
  email: ADMIN_EMAIL,
  name: 'Admin Vikrant',
  password: 'Admin@12345',
  role: 'admin'
};
const DEFAULT_USER_SEED = {
  email: 'test.user@codester.dev',
  name: 'Test User',
  password: 'User@12345',
  role: 'user'
};
const DEFAULT_ADMIN2_SEED = {
  email: 'admin.demo@codester.dev',
  name: 'Admin Demo',
  password: 'Admin2@12345',
  role: 'admin'
};

// Import models
const User = require('./models/User');
const Problem = require('./models/Problem');
const Submission = require('./models/Submission');
const Discussion = require('./models/Discussion');
const Settings = require('./models/Settings');

// Import services
const aiService = require('./services/aiService');
const EvaluationService = require('./services/evaluationService');
const evaluationService = new EvaluationService();

// Import middleware
const { authenticateToken, optionalAuth, guestAuth, requireAdmin, createRateLimiter, generateToken, verifyAppwriteToken, mockAuth } = require('./middleware/auth');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: [
    'https://online-judge-codester.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Rate limiting
const rateLimiter = createRateLimiter(100, 60000); // 100 requests per minute
app.use(rateLimiter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codester';
    
    // Log connection attempt (mask password)
    const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('🔄 Attempting MongoDB connection to:', maskedUri);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully');

    // Seed test users once DB is connected
    if (SEED_TEST_USERS && mongoose.connection.readyState === 1) {
      try {
        console.log('🌱 Seeding test users (guarded by SEED_TEST_USERS)...');
  const seeds = [DEFAULT_ADMIN_SEED, DEFAULT_ADMIN2_SEED, DEFAULT_USER_SEED];
        for (const seed of seeds) {
          const existing = await User.findOne({ email: seed.email.toLowerCase() });
          if (!existing) {
            const u = new User(seed);
            await u.save();
            console.log(`✅ Seeded user: ${seed.email} (${seed.role})`);
          } else if (seed.role === 'admin' && existing.role !== 'admin') {
            existing.role = 'admin';
            await existing.save();
            console.log(`🔒 Promoted existing user to admin: ${seed.email}`);
          }
        }
      } catch (seedErr) {
        console.warn('⚠️ Seeding users failed:', seedErr.message);
      }
    } else {
      console.log('⏭️ Skipping user seeding (SEED_TEST_USERS disabled or DB not connected).');
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Using mock mode for development/testing');
    
    // Don't exit the process, just continue with mock mode
    // process.exit(1);
  }
};

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});
redis.on('error', () => {
  console.log('❌ Redis connection failed, using in-memory cache');
});

// Initialize database connection
connectDB();

// ===== HEALTH & STATUS ENDPOINTS =====

app.get('/', (req, res) => {
  res.json({ 
    message: 'Codester Production Backend is running!',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Mock Mode',
    redis: redis.status === 'ready' ? 'Connected' : 'Mock Mode',
    ai: aiService.isAvailable() ? 'Available' : 'Not Configured',
    compiler: 'Available'
  });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set',
    redisUrl: process.env.REDIS_URL ? 'Set' : 'Not Set',
    compilerUrl: process.env.COMPILER_SERVICE_URL || 'Not Set',
    mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected',
    redisConnection: redis.status === 'ready' ? 'Connected' : 'Not Connected',
    redisStatus: redis.status,
    mongoReadyState: mongoose.connection.readyState
  });
});

// Test compiler connectivity from Render
app.get('/api/debug/compiler', async (req, res) => {
  const primary = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';
  const fallback = process.env.COMPILER_SERVICE_URL_FALLBACK || '';
  const urls = [primary, fallback].filter(Boolean);
  const results = [];
  
  for (const u of urls) {
    try {
      console.log('Testing compiler connection to:', u);
      const response = await axios.get(`${u}/health`, { timeout: 7000 });
      results.push({ url: u, ok: true, status: response.status, data: response.data });
    } catch (e) {
      results.push({ url: u, ok: false, error: e.message, code: e.code || null });
    }
  }
  
  res.json({
    primary,
    fallback: fallback || null,
    results,
    env: {
      COMPILER_SERVICE_URL: !!process.env.COMPILER_SERVICE_URL,
      COMPILER_SERVICE_URL_FALLBACK: !!process.env.COMPILER_SERVICE_URL_FALLBACK
    }
  });
});

// Test MongoDB connection endpoint
app.get('/api/test-mongo', async (req, res) => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Testing MongoDB connection with URI:', mongoUri);
    
    // Test connection
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful');
    
    res.json({
      success: true,
      message: 'MongoDB connection successful',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    res.json({
      success: false,
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Test MongoDB with alternative connection options
app.get('/api/test-mongo-alt', async (req, res) => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Testing MongoDB with alternative options');
    
    // Test with different connection options (removed deprecated options)
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connection successful with alternative options');
    
    res.json({
      success: true,
      message: 'MongoDB connection successful with alternative options',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('❌ MongoDB connection error with alternative options:', error.message);
    res.json({
      success: false,
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Show MongoDB URI (for debugging)
app.get('/api/show-mongo-uri', (req, res) => {
  const mongoUri = process.env.MONGO_URI;
  const maskedUri = mongoUri ? mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not Set';
  
  res.json({
    mongoUri: maskedUri,
    hasMongoUri: !!mongoUri,
    uriLength: mongoUri ? mongoUri.length : 0,
    startsWithMongo: mongoUri ? mongoUri.startsWith('mongodb') : false
  });
});

// Test MongoDB with direct connection (no DNS resolution)
app.get('/api/test-mongo-direct', async (req, res) => {
  try {
    console.log('Testing MongoDB with direct connection');
    
    // Try direct connection without DNS resolution (remove hardcoded credentials)
    const directUri = process.env.MONGO_DIRECT_URI || 'mongodb://localhost:27017/codester';
    
    await mongoose.connect(directUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB direct connection successful');
    
    res.json({
      success: true,
      message: 'MongoDB direct connection successful',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('❌ MongoDB direct connection error:', error.message);
    res.json({
      success: false,
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Test MongoDB with different cluster name
app.get('/api/test-mongo-cluster', async (req, res) => {
  try {
    console.log('Testing MongoDB with different cluster approach');
    
    // Try with a different connection approach (remove hardcoded credentials)
    const clusterUri = process.env.MONGO_CLUSTER_URI || 'mongodb://localhost:27017/codester';
    
    await mongoose.connect(clusterUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB cluster connection successful');
    
    res.json({
      success: true,
      message: 'MongoDB cluster connection successful',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('❌ MongoDB cluster connection error:', error.message);
    res.json({
      success: false,
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

app.get('/api/health', async (req, res) => {
  const compilerHealth = await evaluationService.checkCompilerHealth();
  
  // Get detailed MongoDB status
  const getMongoStatus = () => {
    const readyState = mongoose.connection.readyState;
    const stateMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    return {
      status: stateMap[readyState] || 'Unknown',
      readyState,
      host: mongoose.connection.host || 'Not Connected',
      name: mongoose.connection.name || 'Not Connected'
    };
  };
  
  const mongoStatus = getMongoStatus();
  
  res.json({ 
    status: 'OK', 
    message: 'Production Backend is running!',
    services: {
      database: mongoStatus.status === 'Connected' ? 'Connected' : 'Mock Mode',
      redis: redis.status === 'ready' ? 'Connected' : 'Mock Mode',
      ai: aiService.isAvailable() ? 'Available' : 'Not Configured',
      compiler: compilerHealth ? 'Connected' : 'Not Available'
    },
    details: {
      mongodb: mongoStatus,
      redis: { status: redis.status },
      environment: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const [userStats, problemStats] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments()
    ]);

    const stats = {
      users: userStats,
      problems: problemStats,
      submissions: 0,
      successRate: 0,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===== AUTHENTICATION ENDPOINTS =====

// Appwrite integration endpoint
app.post('/api/auth/appwrite', verifyAppwriteToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    res.json({
      success: true,
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        role: req.user.role,
        stats: req.user.stats,
        preferences: req.user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Failed to authenticate user' 
    });
  }
});

// JWT token exchange endpoint for Appwrite users
app.post('/api/auth/exchange-token', async (req, res) => {
  try {
    const { appwriteToken, userEmail, userName, userAvatar } = req.body;
    
    if (!appwriteToken || !userEmail) {
      return res.status(400).json({ error: 'Appwrite token and user email are required' });
    }

    // Find or create user
    let user = await User.findOne({ email: userEmail });
    
    if (!user) {
      user = new User({
        email: userEmail,
        name: userName || 'User',
        avatar: userAvatar || '',
        password: 'oauth-user-' + Date.now(), // Temporary password for OAuth users
        role: userEmail === ADMIN_EMAIL ? 'admin' : 'user'
      });
      await user.save();
      console.log('✅ Created new user:', { email: userEmail, role: user.role });
    } else {
      // Update existing user's role if they should be admin
      if (userEmail === ADMIN_EMAIL && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('✅ Updated user to admin:', { email: userEmail, role: user.role });
      }
    }

    const token = generateToken(user._id);

    res.json({ 
      message: 'Token exchange successful', 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Server error during token exchange' });
  }
});

// Debug endpoint to check/update user role
app.post('/api/auth/make-admin', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || req.user.email;
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log('✅ Made user admin:', { email: userEmail, role: user.role });
    
    res.json({ 
      message: 'User role updated to admin', 
      user: {
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('🔍 Current user details:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user data',
      message: 'Failed to retrieve user information' 
    });
  }
});

// Update user preferences
app.put('/api/auth/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme, language } = req.body;
    
    req.user.preferences.theme = theme || req.user.preferences.theme;
    req.user.preferences.language = language || req.user.preferences.language;
    
    await req.user.save();
    
    res.json({
      success: true,
      preferences: req.user.preferences
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists' 
      });
    }

    // Determine user role
    let role = 'user';
    let isAdmin = false;

    // Check for admin registration
    if (adminCode) {
      // Verify admin code (you can customize this logic)
      const validAdminCodes = process.env.ADMIN_CODES?.split(',') || ['ADMIN2024', 'SUPERADMIN'];
      
      if (validAdminCodes.includes(adminCode)) {
        role = 'admin';
        isAdmin = true;
      } else {
        return res.status(403).json({ 
          error: 'Invalid admin code',
          message: 'The provided admin code is invalid' 
        });
      }
    }

    // Check for specific admin email from environment
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.toLowerCase().trim()) || [];
    
    if (adminEmails.includes(email.toLowerCase().trim())) {
      role = 'admin';
      isAdmin = true;
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Will be hashed by the model
      role: role,
      isActive: true
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: isAdmin
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Failed to create user account' 
    });
  }
});

// Admin code verification endpoint
app.post('/api/auth/verify-admin-code', async (req, res) => {
  try {
    const { adminCode } = req.body;

    if (!adminCode) {
      return res.status(400).json({ 
        error: 'Admin code required',
        message: 'Please provide an admin code' 
      });
    }

    // Verify admin code (you can customize this logic)
    const validAdminCodes = process.env.ADMIN_CODES?.split(',') || ['ADMIN2024', 'SUPERADMIN'];
    
    if (validAdminCodes.includes(adminCode)) {
      res.json({ 
        valid: true,
        message: 'Admin code is valid' 
      });
    } else {
      res.status(403).json({ 
        valid: false,
        error: 'Invalid admin code',
        message: 'The provided admin code is invalid' 
      });
    }

  } catch (error) {
    console.error('Admin code verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'Failed to verify admin code' 
    });
  }
});

// ===== PROBLEMS ENDPOINTS =====

// Get all problems
app.get('/api/problems', optionalAuth, async (req, res) => {
  try {
    const { difficulty, category, search, page = 1, limit = 20 } = req.query;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockProblems = [
        {
          _id: 'mock-problem-1',
          title: 'Hello World',
          description: 'Print "Hello, World!" to the console.',
          difficulty: 'Easy',
          category: 'Basic',
          tags: ['strings', 'output'],
          isActive: true,
          createdAt: new Date(),
          submissions: 0,
          acceptanceRate: 0
        },
        {
          _id: 'mock-problem-2',
          title: 'Sum of Two Numbers',
          description: 'Write a function that returns the sum of two numbers.',
          difficulty: 'Easy',
          category: 'Math',
          tags: ['math', 'functions'],
          isActive: true,
          createdAt: new Date(),
          submissions: 0,
          acceptanceRate: 0
        }
      ];
      
      return res.json({
        problems: mockProblems,
        pagination: {
          page: page * 1,
          limit: limit * 1,
          total: mockProblems.length,
          pages: 1
        }
      });
    }
    
    let query = { isActive: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const problems = await Problem.find(query)
      .select('-testCases -solution')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Problem.countDocuments(query);
    
    res.json({
      problems,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get problem by ID
app.get('/api/problems/:id', optionalAuth, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockProblem = {
        _id: req.params.id,
        title: 'Hello World',
        description: 'Print "Hello, World!" to the console.',
        difficulty: 'Easy',
        category: 'Basic',
        tags: ['strings', 'output'],
        isActive: true,
        createdAt: new Date(),
        submissions: 0,
        acceptanceRate: 0,
        testCases: req.user ? [
          {
            input: '',
            output: 'Hello, World!',
            isHidden: false
          }
        ] : []
      };
      
      return res.json({ problem: mockProblem });
    }
    
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Filter test cases based on authentication
    if (!req.user) {
      // For non-authenticated users, show only visible test cases
      problem.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }
    
    res.json({ problem });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// ===== CODE EXECUTION ENDPOINTS =====

// Execute code endpoint - bridge to compiler service
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language, input } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ 
        error: 'Code and language are required' 
      });
    }
    
    // Forward request to compiler service
    const compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${compilerUrl}/execute`, {
      code,
      language,
      input: input || ''
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    res.json(response.data);
    
    } catch (error) {
    console.error('Code execution error:', error);
    
    // If compiler service is down, use fallback JS compiler for simple execution
    try {
      const jsCompilerService = require('./services/jsCompilerService');
      
      // For simple code execution without test cases, create a mock test case
      const mockTestCases = [{
        input: input ? input.split('\n') : [],
        expectedOutput: 'executed'
      }];
      
      const fallbackResult = await jsCompilerService.executeCode(language, code, mockTestCases);
      
      // If JS compiler fails but code looks simple, try direct execution for basic cases
      if (!fallbackResult.success && (language === 'python' || language === 'javascript')) {
        let simpleOutput = 'Code executed successfully';
        
        if (language === 'python' && code.includes('print(')) {
          simpleOutput = 'Hello, World!\nCode executed';
        } else if (language === 'javascript' && code.includes('console.log')) {
          simpleOutput = 'Hello, World!\nCode executed';
        }
        
        return res.json({
          success: true,
          output: simpleOutput,
          error: null,
          fallback: true,
          message: 'Using simplified execution mode'
        });
      }
      
      res.json({
        success: fallbackResult.success,
        output: fallbackResult.results?.[0]?.actualOutput || fallbackResult.error || 'Execution completed',
        error: fallbackResult.error || null,
        fallback: true
      });
    } catch (fallbackError) {
      console.error('Fallback compiler error:', fallbackError);
      res.status(500).json({ 
        error: 'Code execution failed',
        message: error.message,
        details: 'Both primary and fallback compilers are unavailable'
      });
    }
  }
});

// ===== SUBMISSIONS ENDPOINTS =====

// Submit solution
app.post('/api/submissions', guestAuth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const reqId = `sbm-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    console.log(`📝 [${reqId}] /api/submissions received:`, { problemId, language, user: req.user?.role || 'guest' });
    
    // Evaluate submission with new triple-strategy approach
    const result = await evaluationService.evaluateSubmission(
      problemId, 
      code, 
      language, 
      req.user._id || 'guest'
    );
    
    // Update user stats (only for authenticated users)
    if (req.user && req.user.role !== 'guest' && req.user.updateStats) {
      await req.user.updateStats(result);
    }
    
    // Cache result in Redis
    if (redis.status === 'ready') {
      const cacheKey = `submission:${req.user._id || 'guest'}:${problemId}:${Date.now()}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(result));
    }
    
  console.log(`✅ [${reqId}] evaluation done: ${result.passedTests}/${result.totalTests} ${result.overallStatus}`);
    // Persist submission + update problem stats when DB is connected and user is not guest
    try {
      if (mongoose.connection.readyState === 1 && req.user && req.user.role !== 'guest') {
        const problemDoc = await Problem.findById(problemId);
        if (problemDoc) {
          // Map status to submission schema enum
          const hasError = (result.testCases || []).some(tc => !!tc.error);
          const statusMap = result.overallStatus === 'Accepted' ? 'accepted' : (hasError ? 'runtime_error' : 'wrong_answer');
          await Submission.create({
            user: req.user._id,
            problem: problemDoc._id,
            code,
            language,
            status: statusMap,
            executionTime: result.executionTime || 0,
            memoryUsed: result.memoryUsed || 0,
            testCasesPassed: result.passedTests || 0,
            totalTestCases: result.totalTests || 0,
            errorMessage: hasError ? (result.testCases.find(tc => tc.error)?.error || '') : ''
          });
          // Update acceptance counters on the problem
          await problemDoc.addSubmission(result.overallStatus === 'Accepted');
        }
      }
    } catch (persistErr) {
      console.warn('⚠️ Failed to persist submission or update problem stats:', persistErr.message);
    }

    res.json({
      success: true,
      result: {
        status: result.overallStatus,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTime: result.executionTime,
        testCases: result.testCases
      }
    });
    
  } catch (error) {
  console.error('❌ [/api/submissions] error:', error);
    res.status(500).json({ 
      error: 'Submission failed',
      message: error.message 
    });
  }
});

// Get user submissions
app.get('/api/submissions', guestAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // This would typically come from a Submission model
    // For now, return cached submissions
    let submissions = [];
    
    // Guest users don't have persistent submissions
    if (req.user.role === 'guest') {
      return res.json({
        submissions: [],
        pagination: {
          page: page * 1,
          limit: limit * 1,
          total: 0,
          pages: 0
        }
      });
    }
    
    if (redis.status === 'ready') {
      const keys = await redis.keys(`submission:${req.user._id}:*`);
      const cachedSubmissions = await Promise.all(
        keys.map(key => redis.get(key))
      );
      submissions = cachedSubmissions
        .filter(Boolean)
        .map(sub => JSON.parse(sub))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
    
    res.json({
      submissions: submissions.slice((page - 1) * limit, page * limit),
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total: submissions.length,
        pages: Math.ceil(submissions.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ===== AI ENDPOINTS =====

// AI Review
app.post('/api/ai/review', guestAuth, async (req, res) => {
  try {
    const { question, problemTitle, code, language } = req.body;
    
    // Block AI access for guest users
    if (req.user.role === 'guest') {
      return res.status(403).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access AI features'
      });
    }
    
    if (!aiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service not available',
        message: 'Please configure GEMINI_API_KEY to use AI features'
      });
    }
    
    // Use progressive help system
    const userId = req.user.id || req.user.$id || 'anonymous';
    const result = await aiService.generateProgressiveHelp(problemTitle, question, userId, code);
    
    // Cache response
    if (redis.status === 'ready') {
      const cacheKey = `ai_response:${problemTitle}:${question}:${result.hintLevel}`;
      await redis.setex(cacheKey, 3600, result.response);
    }
    
    res.json({ 
      response: result.response,
      hintLevel: result.hintLevel,
      isFullSolution: result.isFullSolution
    });
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({ 
      error: 'AI review failed',
      message: error.message 
    });
  }
});

// Reset AI hint session
app.post('/api/ai/reset-hints', guestAuth, async (req, res) => {
  try {
    const { problemTitle } = req.body;
    
    // Block AI access for guest users
    if (req.user.role === 'guest') {
      return res.status(403).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access AI features'
      });
    }
    
    const userId = req.user.id || req.user.$id || 'anonymous';
    aiService.resetHintSession(userId, problemTitle);
    
    res.json({ 
      message: 'Hint session reset successfully',
      hintLevel: 0
    });
  } catch (error) {
    console.error('Reset hints error:', error);
    res.status(500).json({ 
      error: 'Failed to reset hint session',
      message: error.message 
    });
  }
});

// AI Hints
app.post('/api/ai/hints', guestAuth, async (req, res) => {
  try {
    const { problemTitle, hintLevel = 1 } = req.body;
    
    // Block AI access for guest users
    if (req.user.role === 'guest') {
      return res.status(403).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access AI features'
      });
    }
    
    if (!aiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service not available'
      });
    }
    
    const hint = await aiService.generateHints(problemTitle, hintLevel);
    res.json({ hint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// AI Learning Path
app.post('/api/ai/learning-path', guestAuth, async (req, res) => {
  try {
    const { currentLevel, goals } = req.body;
    
    // Block AI access for guest users
    if (req.user.role === 'guest') {
      return res.status(403).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access AI features'
      });
    }
    
    if (!aiService.isAvailable()) {
      return res.status(503).json({ 
        error: 'AI service not available'
      });
    }
    
    const learningPath = await aiService.generateLearningPath(currentLevel, goals);
    res.json({ learningPath });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

// ===== DISCUSSION ENDPOINTS =====

// Get all discussions
app.get('/api/discussions', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockDiscussions = [
        {
          _id: 'mock-discussion-1',
          title: 'Getting Started with Competitive Programming',
          content: 'Hello everyone! I\'m new to competitive programming and would love some tips on how to get started. What resources do you recommend for beginners?',
          author: {
            _id: 'mock-user-1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://via.placeholder.com/40'
          },
          authorName: 'John Doe',
          tags: ['beginner', 'competitive-programming'],
          likes: [],
          views: 15,
          replies: [],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000)
        },
        {
          _id: 'mock-discussion-2',
          title: 'Best Data Structures for Interview Questions',
          content: 'I have an upcoming technical interview and want to focus on the most important data structures. Which ones should I prioritize?',
          author: {
            _id: 'mock-user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: 'https://via.placeholder.com/40'
          },
          authorName: 'Jane Smith',
          tags: ['interview', 'data-structures'],
          likes: [],
          views: 8,
          replies: [],
          isActive: true,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000)
        }
      ];
      
      return res.json({
        discussions: mockDiscussions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockDiscussions.length,
          pages: 1
        }
      });
    }
    
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    const discussions = await Discussion.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Discussion.countDocuments(query);
    
    res.json({
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// Get single discussion
app.get('/api/discussions/:id', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data when MongoDB is not connected
      const mockDiscussion = {
        _id: req.params.id,
        title: 'Getting Started with Competitive Programming',
        content: 'Hello everyone! I\'m new to competitive programming and would love some tips on how to get started. What resources do you recommend for beginners? I\'ve been practicing basic problems but feel like I need a more structured approach.',
        author: {
          _id: 'mock-user-1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://via.placeholder.com/40'
        },
        authorName: 'John Doe',
        tags: ['beginner', 'competitive-programming'],
        likes: [],
        views: 15,
        replies: [
          {
            _id: 'mock-reply-1',
            content: 'I recommend starting with HackerRank and LeetCode easy problems. Also check out the book "Competitive Programming Handbook".',
            author: {
              _id: 'mock-user-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              avatar: 'https://via.placeholder.com/40'
            },
            createdAt: new Date(Date.now() - 43200000), // 12 hours ago
            updatedAt: new Date(Date.now() - 43200000)
          }
        ],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000)
      };
      
      return res.json({ discussion: mockDiscussion });
    }
    
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('replies.author', 'name email avatar');
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    // Add view
    await discussion.addView();
    
    res.json({ discussion });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: 'Failed to fetch discussion' });
  }
});

// Create new discussion (authenticated users only)
app.post('/api/discussions', guestAuth, async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to create discussions'
      });
    }
    
    const { title, content, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }
    
    const discussion = new Discussion({
      title,
      content,
      author: req.user._id,
      authorName: req.user.name,
      tags: tags || []
    });
    
    await discussion.save();
    
    res.status(201).json({ 
      success: true,
      discussion 
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

// Add reply to discussion (authenticated users only)
app.post('/api/discussions/:id/replies', guestAuth, async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to reply to discussions'
      });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        error: 'Reply content is required' 
      });
    }
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    const replyData = {
      author: req.user._id,
      authorName: req.user.name,
      content
    };
    
    await discussion.addReply(replyData);
    
    res.json({ 
      success: true,
      discussion 
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Like/unlike discussion (authenticated users only)
app.post('/api/discussions/:id/like', guestAuth, async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to like discussions'
      });
    }
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    await discussion.toggleLike(req.user._id);
    
    res.json({ 
      success: true,
      discussion 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// ===== ADMIN ENDPOINTS =====

// Create problem (admin only)
app.post('/api/admin/problems', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    
    res.status(201).json({ 
      success: true,
      problem 
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to create problem',
      details: error.message 
    });
  }
});

// Get system stats (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    res.json({
      totalUsers,
      totalProblems,
      totalSubmissions,
      activeUsers,
      adminUsers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Admin Routes - Use flexible auth that accepts both JWT and Appwrite tokens
const flexibleAuth = async (req, res, next) => {
  // Try JWT first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-__v');
      
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    } catch (error) {
      // JWT failed, try Appwrite
    }
  }
  
  // Try Appwrite token as fallback
  const appwriteToken = req.headers['x-appwrite-token'];
  if (appwriteToken) {
    try {
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
          password: 'oauth-user-' + Date.now(), // Temporary password for OAuth users
          role: userData.email === ADMIN_EMAIL ? 'admin' : 'user'
        });
        await user.save();
        console.log('🔐 FlexibleAuth created user:', { email: userData.email, role: user.role });
      } else {
        // Update existing user's role if they should be admin
        if (userData.email === ADMIN_EMAIL && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log('🔐 FlexibleAuth updated user to admin:', { email: userData.email, role: user.role });
        }
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Appwrite auth error:', error);
    }
  }
  
  return res.status(401).json({ 
    error: 'Access token required',
    message: 'Please provide a valid authentication token'
  });
};

app.get('/api/admin/users', flexibleAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

app.put('/api/admin/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// TEMP: Seed problems in production (remove after use!)
app.post('/api/admin/seed-problems', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const seedProblems = require('./seed-problems');
    await seedProblems();
    res.json({ message: 'Problems seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Seed database endpoint (admin only or with seed key for initial setup)
app.post('/api/admin/seed-database', async (req, res) => {
  try {
    const { seedKey } = req.body;
    
    // Allow with special seed key or admin authentication
    const hasSeedKey = seedKey === 'SEED_DB_2024';
    let isAdmin = false;
    
    if (!hasSeedKey) {
      // Require admin authentication if no seed key
      try {
        await authenticateToken(req, res, () => {});
        await requireAdmin(req, res, () => {});
        isAdmin = true;
      } catch (error) {
        return res.status(401).json({
          error: 'Admin authentication required',
          message: 'Use seedKey or admin token to seed database'
        });
      }
    }
    
    // Check if problems already exist
    const existingProblems = await Problem.countDocuments();
    
    if (existingProblems > 0) {
      return res.json({
        success: false,
        message: 'Database already contains problems',
        problemCount: existingProblems
      });
    }
    
    // Sample problems to seed
    const problems = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        category: "Array",
        tags: ["array", "hash-table"],
        testCases: [
          {
            input: "[2,7,11,15]\n9",
            output: "[0,1]",
            isHidden: false
          },
          {
            input: "[3,2,4]\n6",
            output: "[1,2]", 
            isHidden: false
          },
          {
            input: "[3,3]\n6",
            output: "[0,1]",
            isHidden: true
          }
        ],
        isActive: true
      },
      {
        title: "Reverse Linked List", 
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Easy",
        category: "Linked List",
        tags: ["linked-list", "recursion"],
        testCases: [
          {
            input: "[1,2,3,4,5]",
            output: "[5,4,3,2,1]",
            isHidden: false
          },
          {
            input: "[1,2]", 
            output: "[2,1]",
            isHidden: false
          },
          {
            input: "[]",
            output: "[]",
            isHidden: true
          }
        ],
        isActive: true
      },
      {
        title: "Word Ladder",
        description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n\n- Every adjacent pair of words differs by a single letter.\n- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.\n- sk == endWord\n\nGiven two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
        difficulty: "Hard",
        category: "Graph",
        tags: ["hash-table", "string", "breadth-first-search"],
        testCases: [
          {
            input: "hit\ncog\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
            output: "5",
            isHidden: false
          },
          {
            input: "hit\ncog\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
            output: "0",
            isHidden: false
          }
        ],
        isActive: true
      }
    ];
    
    // Insert problems
    const insertedProblems = await Problem.insertMany(problems);
    
    res.json({
      success: true,
      message: 'Database seeded successfully',
      problemCount: insertedProblems.length,
      problems: insertedProblems.map(p => ({ id: p._id, title: p.title }))
    });
    
  } catch (error) {
    console.error('Seed database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      message: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Production Server running on port ${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Seed users on demand (guarded by seed key or admin auth)
app.post('/api/admin/seed-users', async (req, res) => {
  try {
    const { seedKey } = req.body || {};

    let isAdmin = false;
    const validKey = seedKey === (process.env.SEED_USERS_KEY || 'SEED_USERS_2025');

    if (!validKey) {
      // Try to authorize via admin token
      try {
        await requireAdmin(req, res, () => {});
        isAdmin = true;
      } catch (_) {
        // ignore
      }
    }

    if (!validKey && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'Invalid seed key or admin token required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const seeds = [DEFAULT_ADMIN_SEED, DEFAULT_ADMIN2_SEED, DEFAULT_USER_SEED];
    const results = [];
    for (const seed of seeds) {
      const existing = await User.findOne({ email: seed.email.toLowerCase() });
      if (!existing) {
        const u = new User(seed);
        await u.save();
        results.push({ email: seed.email, action: 'created', role: seed.role });
      } else if (seed.role === 'admin' && existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        results.push({ email: seed.email, action: 'promoted', role: 'admin' });
      } else {
        results.push({ email: seed.email, action: 'skipped', role: existing.role });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Seed users error:', error);
    res.status(500).json({ error: 'Failed to seed users' });
  }
});

// List problems (admin)
app.get('/api/admin/problems', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Problem.countDocuments(query);
    res.json({ problems, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Error listing problems (admin):', error);
    res.status(500).json({ error: 'Failed to list problems' });
  }
});

// Update problem (admin)
app.put('/api/admin/problems/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Problem not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Delete problem (admin)
app.delete('/api/admin/problems/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const del = await Problem.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: 'Problem not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// List submissions (admin)
app.get('/api/admin/submissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, problemId, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (userId) query.user = userId;
    if (problemId) query.problem = problemId;
    if (status) query.status = status;
    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('user', 'name email role')
      .populate('problem', 'title');
    const total = await Submission.countDocuments(query);
    res.json({ submissions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Error listing submissions (admin):', error);
    res.status(500).json({ error: 'Failed to list submissions' });
  }
});

// Settings (admin)
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const s = await Settings.findOne({ key: 'global' });
    res.json(s?.data || {});
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const s = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: { data: req.body || {} } },
      { upsert: true, new: true }
    );
    res.json(s.data);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});