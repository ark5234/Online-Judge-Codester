const axios = require('axios');
const Problem = require('../models/Problem');

class EvaluationService {
  constructor() {
    this.compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';
  }

  // Evaluate code against test cases
  async evaluateSubmission(problemId, code, language, userId) {
    try {
      // Get problem details
      const problem = await Problem.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

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

      // Test against each test case
      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        const testResult = await this.runTestCase(code, language, testCase);
        
        results.testCases.push({
          testCaseId: i + 1,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: testResult.output,
          status: testResult.success ? 'Passed' : 'Failed',
          executionTime: testResult.executionTime,
          error: testResult.error
        });

        if (testResult.success) {
          results.passedTests++;
        } else {
          results.overallStatus = 'Wrong Answer';
        }

        results.executionTime = Math.max(results.executionTime, testResult.executionTime);
      }

      // Check for time limit exceeded
      if (results.executionTime > problem.timeLimit) {
        results.overallStatus = 'Time Limit Exceeded';
      }

      // Update problem statistics
      await problem.addSubmission(results.overallStatus === 'Accepted');

      return results;

    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        problemId,
        userId,
        language,
        code,
        overallStatus: 'Error',
        error: error.message,
        testCases: [],
        passedTests: 0,
        totalTests: 0,
        executionTime: 0,
        submittedAt: new Date()
      };
    }
  }

  // Run a single test case
  async runTestCase(code, language, testCase) {
    try {
      // Wrap user code to make it executable
      const executableCode = this.wrapCodeForExecution(code, language, testCase);
      
      const response = await axios.post(`${this.compilerUrl}/execute`, {
        code: executableCode,
        language,
        input: testCase.input
      }, {
        timeout: 15000 // 15 second timeout
      });

      const result = response.data;
      
      if (!result.success) {
        return {
          success: false,
          output: '',
          error: result.error || 'Compilation error',
          executionTime: 0
        };
      }

      // Compare outputs (normalize for comparison)
      const expectedOutput = this.normalizeOutput(testCase.output);
      const actualOutput = this.normalizeOutput(result.output);
      
      return {
        success: expectedOutput === actualOutput,
        output: result.output.trim(),
        error: expectedOutput === actualOutput ? null : `Expected: ${testCase.output}, Got: ${result.output.trim()}`,
        executionTime: result.execution_time || 100
      };

    } catch (error) {
      console.error('Test case execution error:', error);
      return {
        success: false,
        output: '',
        error: `Compiler service error: ${error.message}`,
        executionTime: 0
      };
    }
  }

  // Wrap user code to make it executable
  wrapCodeForExecution(userCode, language, testCase) {
    switch (language) {
      case 'python':
        return `${userCode}

# Test execution
import json
import sys

# Read input
lines = sys.stdin.read().strip().split('\\n')
nums_str = lines[0].strip('[]')
nums = [int(x.strip()) for x in nums_str.split(',')]
target = int(lines[1])

# Call function and print result
result = twoSum(nums, target)
print(json.dumps(result))`;

      case 'javascript':
        return `${userCode}

// Test execution
const fs = require('fs');
const input = fs.readFileSync(process.stdin.fd, 'utf-8').trim().split('\\n');
const numsStr = input[0].replace(/[\\[\\]]/g, '');
const nums = numsStr.split(',').map(n => parseInt(n.trim()));
const target = parseInt(input[1]);

// Call function and print result
const result = twoSum(nums, target);
console.log(JSON.stringify(result));`;

      case 'java':
        return `import java.util.*;
import java.io.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String numsLine = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
            String[] numsStr = numsLine.split(",");
            int[] nums = new int[numsStr.length];
            for (int i = 0; i < numsStr.length; i++) {
                nums[i] = Integer.parseInt(numsStr[i].trim());
            }
            int target = sc.nextInt();
            
            Solution sol = new Solution();
            int[] result = sol.twoSum(nums, target);
            System.out.println(Arrays.toString(result));
            sc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;

      default:
        return userCode;
    }
  }

  // Normalize output for comparison
  normalizeOutput(output) {
    if (!output) return '';
    // Remove all whitespace, brackets, and normalize to compare just the numbers
    return output.toString().trim().replace(/[\s\[\],]/g, '');
  }

  // Check if compiler service is available
  async checkCompilerHealth() {
    try {
      const response = await axios.get(`${this.compilerUrl}/health`, {
        timeout: 5000
      });
      return response.data.status === 'OK';
    } catch (error) {
      console.error('Compiler health check failed:', error);
      return false;
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return [
      { id: 'python', name: 'Python', extension: '.py' },
      { id: 'javascript', name: 'JavaScript', extension: '.js' },
      { id: 'java', name: 'Java', extension: '.java' },
      { id: 'cpp', name: 'C++', extension: '.cpp' }
    ];
  }

  // Validate code syntax (basic check)
  validateCode(code, language) {
    const errors = [];

    if (!code || code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    if (code.length > 10000) {
      errors.push('Code is too long (max 10,000 characters)');
    }

    // Language-specific validations
    switch (language) {
      case 'java':
        if (!code.includes('public class')) {
          errors.push('Java code must contain a public class');
        }
        break;
      case 'cpp':
        if (!code.includes('#include')) {
          errors.push('C++ code should include necessary headers');
        }
        break;
      case 'python':
        // Basic Python syntax check
        if (code.includes('import os') && code.includes('os.system')) {
          errors.push('System commands are not allowed for security reasons');
        }
        break;
      case 'javascript':
        // Basic JavaScript syntax check
        if (code.includes('eval(') || code.includes('Function(')) {
          errors.push('Dynamic code evaluation is not allowed for security reasons');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get evaluation statistics
  async getEvaluationStats() {
    try {
      const stats = await Problem.aggregate([
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: '$totalSubmissions' },
            successfulSubmissions: { $sum: '$successfulSubmissions' },
            averageAcceptanceRate: { $avg: '$acceptanceRate' }
          }
        }
      ]);

      return stats[0] || {
        totalSubmissions: 0,
        successfulSubmissions: 0,
        averageAcceptanceRate: 0
      };
    } catch (error) {
      console.error('Error getting evaluation stats:', error);
      return {
        totalSubmissions: 0,
        successfulSubmissions: 0,
        averageAcceptanceRate: 0
      };
    }
  }
}

module.exports = new EvaluationService(); 