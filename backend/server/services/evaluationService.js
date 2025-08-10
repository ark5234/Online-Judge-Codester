const axios = require('axios');
const Problem = require('../models/Problem');
const DirectExecutionService = require('./DirectExecutionService');
const JavaScriptCompilerService = require('./jsCompilerService');

class EvaluationService {
  constructor() {
  this.compilerUrl = process.env.COMPILER_SERVICE_URL || 'http://localhost:8000';
  this.compilerUrlFallback = process.env.COMPILER_SERVICE_URL_FALLBACK || '';
    this.directExecutor = new DirectExecutionService();
    this.jsCompiler = new JavaScriptCompilerService();
  }

  // NEW IMPROVED: Triple-strategy evaluation system
  async evaluateSubmission(problemId, code, language, userId) {
    console.log(`\n🎯 Evaluation Strategy for ${language}:`);
    
    try {
      // Strategy 1: Direct Local Execution (like the working repo)
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

      // Strategy 2: Remote Compiler Service  
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

  // Remote compiler evaluation (existing logic)
  async evaluateWithRemoteCompiler(problemId, code, language, userId) {
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
      const expectedOut = (typeof testCase.expectedOutput !== 'undefined') ? testCase.expectedOutput : testCase.output;
      
      results.testCases.push({
        testCaseId: i + 1,
        input: testCase.input,
        expectedOutput: expectedOut,
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

  // JavaScript transpilation fallback
  async evaluateWithJSFallback(problemId, code, language, userId) {
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
  }

  // Run individual test case (for remote compiler)
  async runTestCase(code, language, testCase) {
    const startTime = Date.now();
    
    try {
  // Prepare executable code with embedded harness per language
  const executableCode = this.wrapCodeForExecution(code, language, testCase);
  const langForRemote = this.normalizeLanguageForRemote(language);
  const expectedOut = (typeof testCase.expectedOutput !== 'undefined') ? testCase.expectedOutput : testCase.output;
      
      // Try remote compiler first
      try {
  console.log(`🔭 Remote compile request => lang=${langForRemote}`);
  const payload = { code: executableCode, language: langForRemote, input: '' };
  // Generous timeout for heavier compiles (python/java) to avoid premature timeouts
  const remoteTimeout = (langForRemote === 'python' || langForRemote === 'java') ? 20000 : 8000;
  const response = await this.postWithRetry('/execute', payload, 1, remoteTimeout);

  const executionTime = Date.now() - startTime;
  const output = response.data.output || '';
  const success = this.compareOutputs(output.trim(), expectedOut);
        if (!success) {
          console.log(`🟠 Remote mismatch for ${langForRemote}: exp=${JSON.stringify(expectedOut)} act=${output.trim().slice(0,200)}`);
        } else {
          console.log(`🟢 Remote matched for ${langForRemote}`);
        }

        return {
          success,
          output: output.trim(),
          executionTime,
          error: response.data.error || null
        };

  } catch (remoteError) {
        const status = remoteError?.response?.status;
        const rerr = remoteError?.response?.data?.error || remoteError.message;
        console.log(`Remote compiler failed (${status || 'no-status'}): ${String(rerr).slice(0,200)}. Falling back to local JavaScript execution...`);
  return await this.runLocalJavaScript(executableCode, expectedOut);
      }

    } catch (error) {
      return {
        success: false,
        output: '',
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Helper: POST with small retry and optional fallback URL (IP)
  async postWithRetry(path, data, retries = 1, timeoutMs = 10000) {
    const urls = [this.compilerUrl, this.compilerUrlFallback].filter(Boolean);
    let lastErr;
    for (const base of urls) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await axios.post(`${base}${path}`, data, { timeout: timeoutMs });
        } catch (e) {
          lastErr = e;
          const msg = (e?.message || '').toLowerCase();
          const code = (e?.code || '').toLowerCase();
          const isDnsError = msg.includes('enotfound') || code === 'enotfound';
          const retryable = isDnsError || msg.includes('econnrefused') || msg.includes('timeout') || msg.includes('etimedout');
          // If DNS fails for this base URL, skip retries and immediately try the next base (e.g., fallback IP)
          if (isDnsError) {
            break; // break inner loop, move to next base URL
          }
          if (attempt < retries && retryable) {
            await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          break;
        }
      }
      // try next URL if available
    }
    throw lastErr || new Error('Remote request failed');
  }

  // Local JavaScript execution fallback
  async runLocalJavaScript(executableCode, expectedOut) {
    const { VM } = require('vm2');
    const startTime = Date.now();
    
    try {
      const vm = new VM({
        timeout: 5000,
        sandbox: {}
      });
      
      const result = vm.run(executableCode);
      const executionTime = Date.now() - startTime;
      const success = this.compareOutputs(result, expectedOut);
      
      return {
        success,
        output: result,
        executionTime,
        error: null
      };
      
    } catch (error) {
      return {
        success: false,
        output: '',
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Compare outputs
  compareOutputs(actual, expected) {
    // Special-case: treat null/None as [] when expected is an empty array (linked list empty)
    if ((Array.isArray(expected) && expected.length === 0) || (typeof expected === 'string' && expected.trim() === '[]')) {
      const a = (actual ?? '').toString().trim().toLowerCase();
      if (a === 'null' || a === 'none') return true;
    }
    // Mirror the robust logic from DirectExecutionService
    const aStr = (actual ?? '').toString().trim();
    const eRaw = expected;

    // If expected provided as array/object, deep-compare
    if (eRaw && (Array.isArray(eRaw) || typeof eRaw === 'object')) {
      try {
        let aj;
        try { aj = JSON.parse(aStr); }
        catch { aj = JSON.parse(aStr.replace(/'/g, '"')); }
        return JSON.stringify(aj) === JSON.stringify(eRaw);
      } catch { return false; }
    }

    const eStr = (eRaw ?? '').toString().trim();

    // Numeric compare
    if (!isNaN(Number(eStr)) && !isNaN(Number(aStr))) {
      return Number(aStr) === Number(eStr);
    }

    // If either looks like JSON, try JSON deep compare (handles spacing like "[0, 1]" vs "[0,1]")
    const looksJson = (s) => (s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'));
    if (looksJson(eStr) || looksJson(aStr)) {
      try {
        const ej = looksJson(eStr) ? JSON.parse(eStr) : eStr;
        let aj = looksJson(aStr) ? JSON.parse(aStr) : aStr;
        if (!looksJson(aStr) && typeof aj === 'string') {
          aj = JSON.parse(aj.replace(/'/g, '"'));
        }
        return JSON.stringify(aj) === JSON.stringify(ej);
      } catch { /* continue */ }
    }

    // Fallback: compare numeric sequences ignoring separators
    const extractNums = (s) => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(v => Number(v));
    const ea = extractNums(eStr);
    const aa = extractNums(aStr);
    if (ea.length && aa.length) {
      return JSON.stringify(aa) === JSON.stringify(ea);
    }

    return aStr === eStr;
  }

  // Wrap code for execution
  wrapCodeForExecution(userCode, language, testCase) {
    const lang = (language || '').toLowerCase();
    const rawInputString = this.directExecutor.getTestInputString(testCase);
    const cleanCode = this.cleanUserCode(userCode, lang);

    if (lang === 'javascript' || lang === 'js') {
      // Reuse direct executor's JS harness which prints JSON
      return this.directExecutor.buildJavaScriptExecutable(cleanCode, rawInputString);
    }
    if (lang === 'python' || lang === 'python3') {
      return this.directExecutor.buildPythonExecutable(cleanCode, rawInputString);
    }
    if (lang === 'java') {
      return this.directExecutor.buildJavaExecutable(cleanCode, rawInputString);
    }
    if (lang === 'cpp' || lang === 'c++') {
      return this.directExecutor.buildCppExecutable(cleanCode, rawInputString);
    }
    return cleanCode;
  }

  normalizeLanguageForRemote(language) {
    const l = (language || '').toLowerCase();
    if (l === 'js') return 'javascript';
    if (l === 'python3') return 'python';
    if (l === 'c++') return 'cpp';
    return l;
  }

  // Clean user code (remove test harness)
  cleanUserCode(userCode, language) {
    if (language === 'javascript') {
        // Remove common test patterns
        let cleaned = userCode
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
            .replace(/\/\/.*$/gm, '') // Remove // comments
            .replace(/console\.log\s*\([^)]*\)\s*;?/g, '') // Remove console.log statements
            .replace(/console\.assert\s*\([^)]*\)\s*;?/g, ''); // Remove console.assert statements
        
        // Remove test execution blocks
        const lines = cleaned.split('\n');
        const filteredLines = [];
        let inTestBlock = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip test execution patterns
            if (trimmed.includes('console.log(') && trimmed.includes('(')) {
                continue;
            }
            if (trimmed.startsWith('let result =') || trimmed.startsWith('const result =') || trimmed.startsWith('var result =')) {
                continue;
            }
            if (trimmed.includes('.forEach(') || trimmed.includes('.map(')) {
                inTestBlock = true;
                continue;
            }
            if (inTestBlock && (trimmed.includes('}') || trimmed.includes(');'))) {
                inTestBlock = false;
                continue;
            }
            if (inTestBlock) {
                continue;
            }
            
            filteredLines.push(line);
        }
        
        return filteredLines.join('\n').trim();
    }
    
    return userCode;
  }

  // Health check
  async checkCompilerHealth() {
    try {
      const response = await axios.get(`${this.compilerUrl}/health`, {
        timeout: 5000
      });
      return {
        status: 'healthy',
        compilerService: response.data,
        directExecution: await this.directExecutor.healthCheck()
      };
    } catch (error) {
      return {
        status: 'degraded',
        compilerService: { error: error.message },
        directExecution: await this.directExecutor.healthCheck()
      };
    }
  }
}

module.exports = EvaluationService;
