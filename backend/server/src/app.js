require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// API routes
app.use('/api/submissions', require('./api/submissions/routes'));
app.use('/api/ai', require('./api/ai/routes'));

// Fallback route
app.get('*', (req, res) => {
  res.json({ message: 'Codester Backend API' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 