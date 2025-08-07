const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    // Track hint sessions for progressive help
    this.hintSessions = new Map();
  }

  // Initialize AI service lazily
  initialize() {
    if (this.initialized) return;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Please configure GEMINI_API_KEY to use AI features');
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  // Generate progressive help for a problem
  async generateProgressiveHelp(problemTitle, question, userId, code = '') {
    try {
      this.initialize();
      
      // Create or get hint session for this user and problem
      const sessionKey = `${userId}:${problemTitle}`;
      let session = this.hintSessions.get(sessionKey);
      
      if (!session) {
        session = {
          hintCount: 0,
          lastAskTime: Date.now(),
          problemTitle,
          userId
        };
        this.hintSessions.set(sessionKey, session);
      }
      
      // Increment hint count
      session.hintCount++;
      session.lastAskTime = Date.now();
      
      // Clean up old sessions (older than 1 hour)
      this._cleanupOldSessions();
      
      let response;
      
      if (session.hintCount === 1) {
        // First hint - very subtle guidance
        response = await this._generateFirstHint(problemTitle, question, code);
      } else if (session.hintCount === 2) {
        // Second hint - more specific guidance
        response = await this._generateSecondHint(problemTitle, question, code);
      } else if (session.hintCount === 3) {
        // Third hint - direct approach guidance
        response = await this._generateThirdHint(problemTitle, question, code);
      } else {
        // Fourth and beyond - provide full solution
        response = await this._generateFullSolution(problemTitle, question, code);
      }
      
      return {
        response,
        hintLevel: session.hintCount,
        isFullSolution: session.hintCount >= 4
      };
    } catch (error) {
      console.error('AI Progressive Help Error:', error);
      return {
        response: `Sorry, I couldn't provide help at the moment. Please try again later. Error: ${error.message}`,
        hintLevel: 0,
        isFullSolution: false
      };
    }
  }

  // Generate first hint (very subtle)
  async _generateFirstHint(problemTitle, question, code) {
    const prompt = `You are providing the FIRST hint for the programming problem "${problemTitle}".

Student Question: "${question}"
${code ? `Student Code:\n\`\`\`\n${code}\n\`\`\`` : ''}

This is the FIRST hint, so be very subtle and encouraging. Format your response clearly using markdown:

## 💡 First Hint

Provide subtle guidance focusing on:
- Understanding what the problem is asking for
- Identifying the key concepts involved
- Encouraging the student to think about the problem differently

**Keep it brief, encouraging, and very subtle.** Don't mention specific algorithms or data structures yet.

Use markdown formatting with headers (##), **bold** text for emphasis, and bullet points (-) where helpful.`;
    
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Generate second hint (more specific)
  async _generateSecondHint(problemTitle, question, code) {
    const prompt = `You are providing the SECOND hint for the programming problem "${problemTitle}".

Student Question: "${question}"
${code ? `Student Code: \`\`\`\n${code}\n\`\`\`` : ''}

This is the SECOND hint, so you can be more specific but still don't give away the solution.
Focus on:
- Suggesting relevant data structures or algorithms
- Pointing out patterns or approaches to consider
- Helping them think about the problem step by step
- Mentioning common techniques for this type of problem

Be more specific than the first hint, but still guide rather than solve.`;
    
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Generate third hint (direct approach)
  async _generateThirdHint(problemTitle, question, code) {
    const prompt = `You are providing the THIRD hint for the programming problem "${problemTitle}".

Student Question: "${question}"
${code ? `Student Code: \`\`\`\n${code}\n\`\`\`` : ''}

This is the THIRD hint, so you can be quite direct about the approach.
Focus on:
- Explaining the optimal algorithm or approach
- Breaking down the solution into clear steps
- Discussing time and space complexity considerations
- Providing pseudo-code or high-level solution structure

Be direct about the approach but don't provide the complete code solution yet.`;
    
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Generate full solution (after 3 hints)
  async _generateFullSolution(problemTitle, question, code) {
    // Detect the programming language from the question or code
    let language = 'python'; // default
    if (question.toLowerCase().includes('javascript') || question.toLowerCase().includes('js') || 
        (code && (code.includes('const ') || code.includes('function') || code.includes('=>')))) {
      language = 'javascript';
    } else if (question.toLowerCase().includes('java') || 
               (code && (code.includes('public class') || code.includes('public static')))) {
      language = 'java';
    } else if (question.toLowerCase().includes('python') || question.toLowerCase().includes('py') ||
               (code && (code.includes('def ') || code.includes('python')))) {
      language = 'python';
    } else if (question.toLowerCase().includes('c++') || question.toLowerCase().includes('cpp') ||
               (code && (code.includes('#include') || code.includes('int main')))) {
      language = 'cpp';
    }

    const prompt = `You are providing the COMPLETE SOLUTION for the programming problem "${problemTitle}" in ${language.toUpperCase()}.

Student Question: "${question}"
${code ? `Student Code:\n\`\`\`${language}\n${code}\n\`\`\`` : ''}

IMPORTANT: Focus ONLY on ${language.toUpperCase()} language. Provide a correct, working solution specifically for this language.

## 📋 Problem Analysis
Briefly explain what the problem is asking for.

## 🎯 Solution Approach
Step-by-step explanation of the algorithm.

## 💻 ${language.toUpperCase()} Solution
\`\`\`${language}
${this._getTemplateSolution(problemTitle, language)}
\`\`\`

## 🔍 How It Works
1. Explain each key step
2. Walk through with an example
3. Highlight important concepts

## ⚡ Complexity Analysis
- **Time Complexity**: O(?)
- **Space Complexity**: O(?)

## 🧪 Test With Examples
Show how the solution works with the given test cases.

Use proper markdown formatting for readability and copyable code blocks.`;
    
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Get template solution based on problem and language
  _getTemplateSolution(problemTitle, language) {
    if (problemTitle.toLowerCase().includes('two sum')) {
      switch (language) {
        case 'python':
          return `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`;
        
        case 'javascript':
          return `const twoSum = function(nums, target) {
    const numMap = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.hasOwnProperty(complement)) {
            return [numMap[complement], i];
        }
        numMap[nums[i]] = i;
    }
    return [];
};`;
        
        case 'java':
          return `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> numMap = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (numMap.containsKey(complement)) {
            return new int[]{numMap.get(complement), i};
        }
        numMap.put(nums[i], i);
    }
    return new int[0];
}`;
        
        case 'cpp':
          return `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> numMap;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i};
        }
        numMap[nums[i]] = i;
    }
    return {};
}`;
      }
    }
    
    // Default template for unknown problems
    return `// Complete working ${language} solution will be provided here`;
  }

  // Clean up old hint sessions
  _cleanupOldSessions() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, session] of this.hintSessions.entries()) {
      if (session.lastAskTime < oneHourAgo) {
        this.hintSessions.delete(key);
      }
    }
  }

  // Reset hint session for a user and problem
  resetHintSession(userId, problemTitle) {
    const sessionKey = `${userId}:${problemTitle}`;
    this.hintSessions.delete(sessionKey);
  }

  // Generate code review
  async generateCodeReview(code, language, problemTitle) {
    try {
      this.initialize();
      
      const prompt = `You are an expert programming mentor. Review this ${language} code for the problem "${problemTitle}":

\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive review including:
1. **Code Quality**: Is the code readable, well-structured, and follows best practices?
2. **Algorithm Analysis**: Is the approach efficient and correct?
3. **Potential Issues**: Any bugs, edge cases, or improvements needed?
4. **Optimization Suggestions**: How can the code be improved for better performance?
5. **Best Practices**: Any coding standards or patterns that should be followed?

Format your response in markdown with clear sections.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Code Review Error:', error);
      return `Sorry, I couldn't review your code at the moment. Please try again later. Error: ${error.message}`;
    }
  }

  // Generate problem explanation
  async generateProblemExplanation(problemTitle, question) {
    try {
      this.initialize();
      
      const prompt = `You are an expert programming mentor helping with the problem "${problemTitle}".

Student Question: "${question}"

Please provide a helpful explanation including:
1. **Problem Analysis**: Break down what the problem is asking for
2. **Key Concepts**: What algorithms, data structures, or techniques are relevant?
3. **Approach Strategy**: How would you approach solving this problem?
4. **Common Pitfalls**: What mistakes do students often make?
5. **Practice Tips**: How can they improve their problem-solving skills?

Keep your response educational, encouraging, and focused on learning.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Problem Explanation Error:', error);
      return `Sorry, I couldn't provide an explanation at the moment. Please try again later. Error: ${error.message}`;
    }
  }

  // Generate hints for a problem (legacy method - now uses progressive help)
  async generateHints(problemTitle, currentHintLevel = 1) {
    try {
      this.initialize();
      
      const prompt = `You are providing hints for the programming problem "${problemTitle}".

Current hint level: ${currentHintLevel}

Please provide a hint that:
- Is appropriate for hint level ${currentHintLevel} (1 = very subtle, 3 = more direct)
- Helps guide the student without giving away the solution
- Encourages critical thinking
- Is specific to this problem

Format as a single, clear hint.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Hint Generation Error:', error);
      return `Sorry, I couldn't generate a hint at the moment. Please try again later.`;
    }
  }

  // Generate solution explanation
  async generateSolutionExplanation(problemTitle, solutionCode, language) {
    try {
      this.initialize();
      
      const prompt = `You are explaining a solution to the programming problem "${problemTitle}".

Here's the solution code in ${language}:

\`\`\`${language}
${solutionCode}
\`\`\`

Please provide a detailed explanation including:
1. **Algorithm Overview**: What approach does this solution use?
2. **Code Walkthrough**: Step-by-step explanation of how the code works
3. **Time & Space Complexity**: What are the performance characteristics?
4. **Key Insights**: What are the important concepts demonstrated?
5. **Alternative Approaches**: What other ways could this problem be solved?

Make the explanation educational and suitable for learning.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Solution Explanation Error:', error);
      return `Sorry, I couldn't explain the solution at the moment. Please try again later.`;
    }
  }

  // Generate practice problems
  async generatePracticeProblems(topic, difficulty = 'medium', count = 3) {
    try {
      this.initialize();
      
      const prompt = `You are creating practice programming problems for the topic "${topic}" at ${difficulty} difficulty level.

Please generate ${count} practice problems. For each problem, provide:
1. **Title**: A clear, descriptive title
2. **Description**: Detailed problem statement
3. **Difficulty**: Easy/Medium/Hard
4. **Category**: What topic this covers
5. **Example Input/Output**: At least one test case
6. **Constraints**: Any limitations or requirements

Format as a JSON array with these fields.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Practice Problem Generation Error:', error);
      return `Sorry, I couldn't generate practice problems at the moment. Please try again later.`;
    }
  }

  // Generate learning path
  async generateLearningPath(currentLevel, goals) {
    try {
      this.initialize();
      
      const prompt = `You are creating a personalized learning path for a programmer.

Current Level: ${currentLevel}
Goals: ${goals}

Please create a structured learning path including:
1. **Prerequisites**: What should they know already?
2. **Core Topics**: Essential concepts to master
3. **Practice Problems**: Recommended problems to solve
4. **Resources**: Books, courses, or materials to study
5. **Timeline**: Suggested timeframes for each topic
6. **Milestones**: How to measure progress

Format as a structured learning plan.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Learning Path Generation Error:', error);
      return `Sorry, I couldn't generate a learning path at the moment. Please try again later.`;
    }
  }

  // Check if AI service is available
  isAvailable() {
    return !!process.env.GEMINI_API_KEY;
  }

  // Get AI service status
  getStatus() {
    return {
      available: this.isAvailable(),
      model: 'gemini-2.0-flash',
      features: [
        'progressive_help',
        'code_review',
        'problem_explanation',
        'hints',
        'solution_explanation',
        'practice_problems',
        'learning_path'
      ]
    };
  }
}

module.exports = new AIService(); 