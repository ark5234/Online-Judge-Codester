require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./api/auth/routes');
const problemRoutes = require('./api/problems/routes');
const submissionRoutes = require('./api/submissions/routes');
const adminRoutes = require('./api/admin/routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Placeholder routes
app.use('/auth', authRoutes);
app.use('/problems', problemRoutes);
app.use('/submissions', submissionRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 