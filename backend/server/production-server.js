const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Problem = require('./models/Problem');
const Submission = require('./models/Submission');
const Discussion = require('./models/Discussion');

// Import services
const aiService = require('./services/aiService');
const evaluationService = require('./services/evaluationService');

// Import middleware
const { authenticateToken, optionalAuth, guestAuth, requireAdmin, createRateLimiter, generateToken, verifyAppwriteToken, mockAuth } = require('./middleware/auth');

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const rateLimiter = createRateLimiter(100, 60000); // 100 requests per minute
app.use(rateLimiter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codester';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection failed, using mock mode');
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
    mongoConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected',
    redisConnection: redis.status === 'ready' ? 'Connected' : 'Not Connected',
    redisStatus: redis.status,
    mongoReadyState: mongoose.connection.readyState
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
    
    // Test with different connection options
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
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
    
    // Try direct connection without DNS resolution
    const directUri = 'mongodb://vikrantkawadkar2099:oj_data%402099@cluster0-shard-00-00.8ndl519.mongodb.net:27017,cluster0-shard-00-01.8ndl519.mongodb.net:27017,cluster0-shard-00-02.8ndl519.mongodb.net:27017/codester?ssl=true&replicaSet=atlas-xxxxx&authSource=admin&retryWrites=true&w=majority';
    
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
    
    // Try with a different connection approach
    const clusterUri = 'mongodb+srv://vikrantkawadkar2099:oj_data%402099@cluster0.8ndl519.mongodb.net/codester?retryWrites=true&w=majority&ssl=true&authSource=admin&directConnection=false';
    
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
  
  res.json({ 
    status: 'OK', 
    message: 'Production Backend is running!',
    services: {
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Mock Mode',
      redis: redis.status === 'ready' ? 'Connected' : 'Mock Mode',
      ai: aiService.isAvailable() ? 'Available' : 'Not Configured',
      compiler: compilerHealth ? 'Connected' : 'Not Available'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const [userStats, problemStats, evaluationStats] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      evaluationService.getEvaluationStats()
    ]);

    const stats = {
      users: userStats,
      problems: problemStats,
      submissions: evaluationStats.totalSubmissions,
      successRate: evaluationStats.averageAcceptanceRate,
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

// Get current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
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

    // Check for specific admin email
    if (email.toLowerCase().trim() === 'vikrantkawadkar2099@gmail.com') {
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
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get problem by ID
app.get('/api/problems/:id', optionalAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Don't send test cases to non-authenticated users
    if (!req.user) {
      problem.testCases = [];
    }
    
    res.json({ problem });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// ===== SUBMISSIONS ENDPOINTS =====

// Submit solution
app.post('/api/submissions', guestAuth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    
    // Validate code
    const validation = evaluationService.validateCode(code, language);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Code validation failed',
        details: validation.errors
      });
    }
    
    // Evaluate submission
    const result = await evaluationService.evaluateSubmission(
      problemId, 
      code, 
      language, 
      req.user._id
    );
    
    // Update user stats (only for authenticated users)
    if (req.user.role !== 'guest') {
      await req.user.updateStats(result);
    }
    
    // Cache result in Redis
    if (redis.status === 'ready') {
      const cacheKey = `submission:${req.user._id}:${problemId}:${Date.now()}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(result));
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
    console.error('Submission error:', error);
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
    
    let response;
    if (code) {
      response = await aiService.generateCodeReview(code, language, problemTitle);
    } else {
      response = await aiService.generateProblemExplanation(problemTitle, question);
    }
    
    // Cache response
    if (redis.status === 'ready') {
      const cacheKey = `ai_response:${problemTitle}:${question}`;
      await redis.setex(cacheKey, 3600, response);
    }
    
    res.json({ response });
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({ 
      error: 'AI review failed',
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

// Admin Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
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

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
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
  console.log(`🚀 Production Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submissions: http://localhost:${PORT}/api/submissions`);
  console.log(`🤖 AI Review: http://localhost:${PORT}/api/ai/review`);
  console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});