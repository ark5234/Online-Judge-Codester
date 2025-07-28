const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Generate code review
  async generateCodeReview(code, language, problemTitle) {
    try {
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

  // Generate hints for a problem
  async generateHints(problemTitle, currentHintLevel = 1) {
    try {
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
      model: 'gemini-pro',
      features: [
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