const RunnerFactory = require('./Runner/RunnerFactory');
const Problem = require('../models/Problem');

class DirectExecutionService {
  constructor() {
    this.supportedLanguages = RunnerFactory.getSupportedLanguages();
  }

  async evaluateSubmission(problemId, code, language, userId) {
    try {
      console.log(`\n🚀 Direct Execution: Evaluating ${language} submission`);
      
      // Get problem details
      const problem = await Problem.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      // Check if language is supported
      if (!RunnerFactory.isLanguageSupported(language)) {
        throw new Error(`Language ${language} is not supported`);
      }

      // Create appropriate runner
      const runner = RunnerFactory.createRunner(language);

      const results = {
        problemId,
        userId,
        language,
        code,
        testCases: [],
        overallStatus: 'Accepted',
        passedTests: 0,
        totalTests: problem.testCases.length,
        executionTime: 0,
        memoryUsed: 0,
        submittedAt: new Date()
      };

      // Process each test case
      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        const startTime = Date.now();

        try {
          // Prepare input for the test case
          const input = this.formatInput(testCase.input);
          
          // Execute the code
          const executionResult = await runner.execute(code, input);
          const executionTime = Date.now() - startTime;

          // Compare output
          const passed = this.compareOutputs(
            executionResult.output, 
            testCase.expectedOutput
          );

          const testResult = {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: executionResult.output,
            passed,
            executionTime,
            error: executionResult.error
          };

          results.testCases.push(testResult);
          results.executionTime += executionTime;

          if (passed) {
            results.passedTests++;
          } else {
            results.overallStatus = 'Wrong Answer';
          }

          console.log(`✅ Test ${i + 1}/${problem.testCases.length}: ${passed ? 'PASSED' : 'FAILED'}`);

        } catch (error) {
          console.error(`❌ Test ${i + 1} execution error:`, error.message);
          
          results.testCases.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            passed: false,
            executionTime: Date.now() - startTime,
            error: error.message
          });
          
          results.overallStatus = 'Runtime Error';
        }
      }

      console.log(`🎯 Final Result: ${results.passedTests}/${results.totalTests} tests passed`);
      return results;

    } catch (error) {
      console.error('❌ Direct Execution Error:', error.message);
      throw error;
    }
  }

  formatInput(input) {
    if (Array.isArray(input)) {
      return input.map(item => 
        Array.isArray(item) ? JSON.stringify(item) : String(item)
      ).join('\n');
    }
    return String(input);
  }

  compareOutputs(actual, expected) {
    if (typeof expected === 'number') {
      return Number(actual.trim()) === expected;
    }
    
    if (Array.isArray(expected)) {
      try {
        const actualArray = JSON.parse(actual.trim());
        return JSON.stringify(actualArray) === JSON.stringify(expected);
      } catch {
        return false;
      }
    }
    
    return actual.trim() === String(expected).trim();
  }

  async healthCheck() {
    const health = {
      service: 'Direct Execution Service',
      status: 'OK',
      supportedLanguages: this.supportedLanguages,
      timestamp: Date.now()
    };

    // Test each language runner
    for (const language of this.supportedLanguages) {
      try {
        const runner = RunnerFactory.createRunner(language);
        health[`${language}_runner`] = 'Available';
      } catch (error) {
        health[`${language}_runner`] = `Error: ${error.message}`;
        health.status = 'Degraded';
      }
    }

    return health;
  }
}

module.exports = DirectExecutionService;
