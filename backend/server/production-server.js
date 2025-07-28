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

// Import services
const aiService = require('./services/aiService');
const evaluationService = require('./services/evaluationService');

// Import middleware
const { authenticateToken, optionalAuth, requireAdmin, createRateLimiter, generateToken, verifyAppwriteToken, mockAuth } = require('./middleware/auth');

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

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
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
app.post('/api/submissions', mockAuth, async (req, res) => {
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
    
    // Update user stats
    await req.user.updateStats(result);
    
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
app.get('/api/submissions', mockAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // This would typically come from a Submission model
    // For now, return cached submissions
    let submissions = [];
    
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
app.post('/api/ai/review', mockAuth, async (req, res) => {
  try {
    const { question, problemTitle, code, language } = req.body;
    
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
app.post('/api/ai/hints', mockAuth, async (req, res) => {
  try {
    const { problemTitle, hintLevel = 1 } = req.body;
    
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
app.post('/api/ai/learning-path', mockAuth, async (req, res) => {
  try {
    const { currentLevel, goals } = req.body;
    
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
    const [userStats, problemStats, evaluationStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            averageAccuracy: { $avg: '$stats.accuracy' }
          }
        }
      ]),
      Problem.aggregate([
        {
          $group: {
            _id: null,
            totalProblems: { $sum: 1 },
            activeProblems: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            averageDifficulty: { $avg: { $cond: [
              { $eq: ['$difficulty', 'Easy'] }, 1,
              { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 2, 3] }
            ]}}
          }
        }
      ]),
      evaluationService.getEvaluationStats()
    ]);
    
    res.json({
      users: userStats[0] || {},
      problems: problemStats[0] || {},
      evaluations: evaluationStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get admin stats' });
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