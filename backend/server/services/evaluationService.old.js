const axios = require('axios');
const Problem = require('../models/Problem');
const DirectExecutionService = require('./DirectExecutionService');
const JavaScriptCompilerService = require('./jsCompilerService');

class EvaluationService {
  constructor() {
    this.compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';
    this.directExecutor = new DirectExecutionService();
    this.jsCompiler = new JavaScriptCompilerService();
  }

  // Evaluate code against test cases - NEW IMPROVED VERSION
  async evaluateSubmission(problemId, code, language, userId) {
    console.log(`\n🎯 Evaluation Strategy for ${language}:`);
    
    try {
      // Strategy 1: Try Direct Local Execution (like the other repo)
      if (this.directExecutor.supportedLanguages.includes(language.toLowerCase())) {
        console.log('📍 Strategy 1: Direct Local Execution (Primary)');
        try {
          const result = await this.directExecutor.evaluateSubmission(problemId, code, language, userId);
          console.log('✅ Direct execution successful!');
          return result;
        } catch (error) {
          console.log('⚠️ Direct execution failed:', error.message);
          console.log('📍 Falling back to Strategy 2...');
        }
      }

      // Strategy 2: Try Remote Compiler Service  
      console.log('📍 Strategy 2: Remote Compiler Service');
      try {
        const result = await this.evaluateWithRemoteCompiler(problemId, code, language, userId);
        console.log('✅ Remote compiler successful!');
        return result;
      } catch (error) {
        console.log('⚠️ Remote compiler failed:', error.message);
        console.log('📍 Falling back to Strategy 3...');
      }

      // Strategy 3: JavaScript Transpilation Fallback
      console.log('📍 Strategy 3: JavaScript Transpilation Fallback');
      const result = await this.evaluateWithJSFallback(problemId, code, language, userId);
      console.log('✅ JavaScript fallback successful!');
      return result;

    } catch (error) {
      console.error('❌ All evaluation strategies failed:', error.message);
      throw error;
    }
  }

  // NEW: Remote compiler evaluation (your existing logic)
  async evaluateWithRemoteCompiler(problemId, code, language, userId) {
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

    return results;
  }

  // NEW: JavaScript transpilation fallback
  async evaluateWithJSFallback(problemId, code, language, userId) {
    try {
      // Get problem details
      const problem = await Problem.findById(problemId);
      if (!problem) {
        throw new Error('Problem not found');
      }

      console.log('🔄 Using JavaScript transpilation fallback...');
      const result = await this.jsCompiler.executeCode(language, code, problem.testCases);
      
      return {
        problemId,
        userId,
        language,
        code,
        testCases: result.results || [],
        overallStatus: result.success ? 'Accepted' : 'Wrong Answer',
        passedTests: result.results ? result.results.filter(r => r.passed).length : 0,
        totalTests: problem.testCases.length,
        executionTime: result.executionTime || 0,
        memoryUsed: 0,
        submittedAt: new Date(),
        compiler: 'JavaScript Transpiler'
      };
    } catch (error) {
      throw new Error(`JavaScript fallback evaluation failed: ${error.message}`);
    }
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
      // Try Azure compiler first
      const executableCode = this.wrapCodeForExecution(code, language, testCase);
      
      try {
        const response = await axios.post(`${this.compilerUrl}/execute`, {
          code: executableCode,
          language,
          input: testCase.input
        }, {
          timeout: 10000 // 10 second timeout
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

      } catch (compilerError) {
        console.log('⚠️ Azure compiler failed, falling back to local execution...');
        console.log('Compiler error:', compilerError.message);
        
        // Fallback to local execution for JavaScript
        if (language === 'javascript') {
          return await this.runLocalJavaScript(executableCode, testCase);
        } else {
          // For other languages, return compiler error
          return {
            success: false,
            output: '',
            error: `Compiler service unavailable: ${compilerError.message}`,
            executionTime: 0
          };
        }
      }

    } catch (error) {
      console.error('Test case execution error:', error);
      return {
        success: false,
        output: '',
        error: `Execution error: ${error.message}`,
        executionTime: 0
      };
    }
  }

  // Local JavaScript execution fallback
  async runLocalJavaScript(executableCode, testCase) {
    try {
      console.log('🔄 Running JavaScript locally...');
      
      // Create a safe execution environment
      const vm = require('vm');
      const util = require('util');
      
      // Mock console.log to capture output
      let output = '';
      const mockConsole = {
        log: (...args) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ') + '\n';
        }
      };
      
      // Mock fs for reading input
      const mockFs = {
        readFileSync: (fd, encoding) => {
          if (fd === 0) { // stdin
            return testCase.input;
          }
          throw new Error('File not found');
        }
      };
      
      // Create execution context
      const context = {
        console: mockConsole,
        fs: mockFs,
        require: (module) => {
          if (module === 'fs') return mockFs;
          throw new Error(`Module ${module} not available`);
        },
        process: {
          stdin: { fd: 0 }
        },
        JSON,
        Map,
        Set,
        Array,
        Object,
        parseInt,
        parseFloat,
        Math,
        String,
        Number,
        Boolean
      };
      
      // Execute code with timeout
      const script = new vm.Script(executableCode);
      vm.createContext(context);
      
      const startTime = Date.now();
      script.runInContext(context, { timeout: 5000 });
      const executionTime = Date.now() - startTime;
      
      // Compare outputs
      const expectedOutput = this.normalizeOutput(testCase.output);
      const actualOutput = this.normalizeOutput(output.trim());
      
      return {
        success: expectedOutput === actualOutput,
        output: output.trim(),
        error: expectedOutput === actualOutput ? null : `Expected: ${testCase.output}, Got: ${output.trim()}`,
        executionTime
      };
      
    } catch (error) {
      console.error('Local JavaScript execution failed:', error);
      return {
        success: false,
        output: '',
        error: `Local execution failed: ${error.message}`,
        executionTime: 0
      };
    }
  }

  // Wrap user code to make it executable
  wrapCodeForExecution(userCode, language, testCase) {
    console.log('Wrapping code for execution...');
    console.log('User code:', userCode);
    console.log('Language:', language);
    console.log('Test case:', testCase);
    
    // Clean user code by removing test harness
    const cleanCode = this.cleanUserCode(userCode, language);
    console.log('Cleaned code:', cleanCode);
    
    // Extract function name from the cleaned code
    let functionName = 'solution'; // default fallback
    
    if (language === 'javascript') {
        const funcMatch = cleanCode.match(/function\s+(\w+)\s*\(/);
        const arrowMatch = cleanCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
        if (funcMatch) {
            functionName = funcMatch[1];
        } else if (arrowMatch) {
            functionName = arrowMatch[1];
        }
    } else if (language === 'python') {
        const funcMatch = cleanCode.match(/def\s+(\w+)\s*\(/);
        if (funcMatch) {
            functionName = funcMatch[1];
        }
    } else if (language === 'java') {
        const funcMatch = cleanCode.match(/public\s+(?:static\s+)?(?:int\[\]|String\[\]|int|String|boolean|long|double)\s+(\w+)\s*\(/);
        if (funcMatch) {
            functionName = funcMatch[1];
        }
    }
    
    console.log('Detected function name:', functionName);
    
    switch (language) {
      case 'python':
        return `${cleanCode}

# Test execution
import json
import sys

# Read input
lines = sys.stdin.read().strip().split('\\n')
nums_str = lines[0].strip('[]')
nums = [int(x.strip()) for x in nums_str.split(',')]
target = int(lines[1])

# Call function and print result
result = ${functionName}(nums, target)
print(json.dumps(result))`;

      case 'javascript':
        return `${cleanCode}

// Test execution
const fs = require('fs');
const input = fs.readFileSync(process.stdin.fd, 'utf-8').trim().split('\\n');
const numsStr = input[0].replace(/[\\[\\]]/g, '');
const nums = numsStr.split(',').map(n => parseInt(n.trim()));
const target = parseInt(input[1]);

// Call function and print result
const result = ${functionName}(nums, target);
console.log(JSON.stringify(result));`;

      case 'java':
        return `import java.util.*;
import java.io.*;

${cleanCode}

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
            int[] result = sol.${functionName}(nums, target);
            System.out.println(Arrays.toString(result));
            sc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;

      default:
        return cleanCode;
    }
  }

  // Clean user code by removing test harness/driver code
  cleanUserCode(userCode, language) {
    let lines = userCode.split('\n');
    let cleanLines = [];
    let insideFunction = false;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (language === 'javascript') {
        // Start of function
        if (line.includes('function ') || line.match(/^(const|let|var)\s+\w+\s*=/)) {
          insideFunction = true;
          cleanLines.push(lines[i]);
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          continue;
        }
        
        // Inside function
        if (insideFunction) {
          cleanLines.push(lines[i]);
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          
          // End of function
          if (braceCount <= 0) {
            insideFunction = false;
          }
          continue;
        }
        
        // Skip driver code/test code (common patterns)
        if (line.includes('console.log') || 
            line.includes('let arr') || 
            line.includes('let target') ||
            line.includes('const arr') || 
            line.includes('const target') ||
            line.includes('var arr') || 
            line.includes('var target') ||
            line.match(/^(let|const|var)\s+\w+\s*=\s*\[/) ||
            line.includes('if (') && line.includes('console.log') ||
            line.includes('else') && line.includes('console.log')) {
          continue; // Skip this line
        }
        
      } else if (language === 'python') {
        // Start of function
        if (line.startsWith('def ')) {
          insideFunction = true;
          cleanLines.push(lines[i]);
          continue;
        }
        
        // Inside function (check indentation)
        if (insideFunction && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || line === '')) {
          cleanLines.push(lines[i]);
          continue;
        }
        
        // End of function
        if (insideFunction && !lines[i].startsWith('    ') && !lines[i].startsWith('\t') && line !== '') {
          insideFunction = false;
        }
        
        // Skip driver code
        if (line.startsWith('arr =') || 
            line.startsWith('target =') ||
            line.startsWith('print(') ||
            line.includes('two_sum(') ||
            line.includes('solution(')) {
          continue;
        }
      }
      
      // For unknown patterns, include the line if we're not clearly in driver code
      if (!insideFunction) {
        // Only add if it looks like a function or class definition
        if (line.includes('function ') || 
            line.includes('def ') || 
            line.includes('class ') ||
            line.includes('//') ||
            line.includes('#') ||
            line === '') {
          cleanLines.push(lines[i]);
        }
      }
    }
    
    return cleanLines.join('\n').trim();
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
      console.log('🔍 Checking compiler service health at:', this.compilerUrl);
      const response = await axios.get(`${this.compilerUrl}/health`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Codester-Backend/1.0'
        }
      });
      
      console.log('✅ Compiler service response:', response.data);
      // Handle both 'OK' and 'healthy' status responses
      const isHealthy = response.data.status === 'OK' || response.data.status === 'healthy';
      console.log('🏥 Compiler health status:', isHealthy);
      return isHealthy;
    } catch (error) {
      console.error('❌ Compiler health check failed:', {
        url: this.compilerUrl,
        error: error.message,
        code: error.code,
        status: error.response?.status
      });
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