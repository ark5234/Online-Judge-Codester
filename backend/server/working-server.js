const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Codester Backend is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Submissions endpoint
app.post('/api/submissions', (req, res) => {
  console.log('📝 Submission received:', req.body);
  
  const { problemId, code, language } = req.body;
  
  // Simple evaluation
  let status = 'Wrong Answer';
  let message = 'Code needs improvement';
  let passedTests = 0;
  let totalTests = 3;
  
  if (code && code.length > 20) {
    status = 'Accepted';
    message = 'Great job! All test cases passed!';
    passedTests = 3;
  }
  
  const response = {
    status,
    message,
    passedTests,
    totalTests,
    submissionId: Date.now()
  };
  
  console.log('📤 Sending response:', response);
  res.json(response);
});

// AI Review endpoint
app.post('/api/ai/review', (req, res) => {
  console.log('🤖 AI request received:', req.body);
  
  const { question, problemTitle } = req.body;
  
  const response = `Thank you for your question about "${problemTitle}": "${question}"

Here's a helpful response:

**Problem Analysis:**
This is a classic algorithmic problem that tests your understanding of data structures and algorithms.

**Key Concepts:**
- Understanding the problem requirements
- Choosing the right data structure
- Optimizing time and space complexity

**Tips:**
- Always start with a brute force solution
- Think about edge cases
- Consider different approaches

**Next Steps:**
Try implementing a solution and test it with the provided examples. If you need more specific help, feel free to ask!`;

  console.log('📤 Sending AI response');
  res.json({ response });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submissions: http://localhost:${PORT}/api/submissions`);
  console.log(`🤖 AI Review: http://localhost:${PORT}/api/ai/review`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
}); 