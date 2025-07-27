const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (you'll need to set GEMINI_API_KEY in your .env file)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

exports.review = async (req, res) => {
  try {
    const { question, problemTitle, problemDescription, userCode, language } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Create a comprehensive prompt for the AI
    const prompt = `
You are an expert programming tutor and code reviewer. Help the user with their question about this coding problem.

Problem: ${problemTitle}
Description: ${problemDescription}

User's Code (${language}):
${userCode}

User's Question: ${question}

Please provide a helpful, educational response. If they're asking about their code, review it and suggest improvements. If they're asking about the problem, explain the concepts clearly. Be encouraging and provide actionable advice.

Keep your response concise but comprehensive. Use markdown formatting for better readability.
    `;

    // For demo purposes, if no API key is set, return a mock response
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-api-key-here') {
      const mockResponses = {
        'explain': `Here's a clear explanation of the ${problemTitle} problem:

**Problem Overview:**
${problemDescription}

**Key Concepts:**
- This is a classic algorithmic problem that tests your understanding of data structures
- The optimal solution typically involves using a specific approach (like two pointers, hash maps, etc.)

**Approach:**
1. First, understand what the problem is asking for
2. Consider the time and space complexity requirements
3. Think about edge cases
4. Implement your solution step by step

**Tips:**
- Always test with the provided examples first
- Consider different input scenarios
- Think about the most efficient algorithm

Would you like me to explain any specific part in more detail?`,
        
        'review': `Let me review your code for the ${problemTitle} problem:

**Code Analysis:**
Your current implementation shows good structure, but here are some suggestions:

**Strengths:**
- Clean code organization
- Good variable naming
- Proper function structure

**Areas for Improvement:**
- Consider adding input validation
- Think about edge cases
- Optimize the algorithm if possible

**Suggested Optimizations:**
1. Add error handling for edge cases
2. Consider using more efficient data structures
3. Add comments to explain complex logic

**Next Steps:**
Try implementing these suggestions and test with different inputs. Would you like me to help you with any specific part?`,
        
        'hint': `Here's a helpful hint for the ${problemTitle} problem:

**Key Insight:**
Think about what data structure would be most efficient for this problem. Consider the time complexity of different approaches.

**Hint:**
- What if you could store previously seen values?
- How could you use a hash map or set to optimize your solution?
- Consider the trade-off between time and space complexity

**Approach:**
1. Start with a brute force solution to understand the problem
2. Identify the bottleneck in your current approach
3. Think about what information you could store to avoid repeated work

Try implementing this hint and let me know if you need more guidance!`
      };

      let response = mockResponses.explain;
      if (question.toLowerCase().includes('review') || question.toLowerCase().includes('code')) {
        response = mockResponses.review;
      } else if (question.toLowerCase().includes('hint') || question.toLowerCase().includes('help')) {
        response = mockResponses.hint;
      }

      return res.json({ response });
    }

    // Use actual Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({ response });
  } catch (error) {
    console.error('AI Review error:', error);
    res.status(500).json({ 
      message: 'Failed to get AI response',
      error: error.message 
    });
  }
}; 