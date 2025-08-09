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
          // Build executable code or input per language
          let executionResult;
          if (language.toLowerCase() === 'python') {
            const rawInput = this.getTestInputString(testCase);
            const executable = this.buildPythonExecutable(code, rawInput);
            executionResult = await runner.execute(executable, '');
          } else if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
            const rawInput = this.getTestInputString(testCase);
            const executable = this.buildJavaScriptExecutable(code, rawInput);
            executionResult = await runner.execute(executable, '');
          } else {
            // Prepare input for the test case
            const input = this.formatInput(this.getTestInput(testCase));
            executionResult = await runner.execute(code, input);
          }
          const executionTime = Date.now() - startTime;

          // Compare output
          const expected = this.getExpectedOutput(testCase);
          const passed = this.compareOutputs(executionResult.output, expected);

          const testResult = {
            input: this.getTestInput(testCase),
            expectedOutput: this.getExpectedOutput(testCase),
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
  getTestInput(testCase) {
    // Support both schemas: { input: <typed|string> } and legacy { input: any }
    return typeof testCase.input !== 'undefined' ? testCase.input : testCase.inputs;
  }

  getTestInputString(testCase) {
    const input = this.getTestInput(testCase);
    return Array.isArray(input) ? JSON.stringify(input) : String(input ?? '');
  }

  getExpectedOutput(testCase) {
    // Support both keys: expectedOutput (in code tests) and output (in DB schema)
    return typeof testCase.expectedOutput !== 'undefined' ? testCase.expectedOutput : testCase.output;
  }


  // Build a Python harness that calls user's function/class with parsed inputs
  buildPythonExecutable(userCode, testInputString) {
    const inputJsonLiteral = JSON.stringify(String(testInputString || ''));
    // Attempt to detect class Solution method or top-level function
    let funcName = 'solution';
    const classMethodMatch = userCode.match(/class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self\s*,/);
    if (classMethodMatch) {
      funcName = classMethodMatch[1];
    } else {
      const defMatch = userCode.match(/def\s+(\w+)\s*\(/);
      if (defMatch) funcName = defMatch[1];
    }

  const harness = `\n\n# === Codester Harness (auto-generated) ===\nimport json, ast\n\n_def_name = ${JSON.stringify(funcName)}\n\ndef __parse_inputs(s: str):\n    # Try JSON array first (e.g. "[ [2,7,11,15], 9 ]")\n    try:\n        data = json.loads(s)\n        if isinstance(data, list):\n            return data\n    except Exception:\n        pass\n    # Fallback: line-wise values (e.g. "[2,7,11,15]\\n9")\n    vals = []\n    for ln in [ln for ln in s.splitlines() if ln.strip()]:\n        try:\n            vals.append(ast.literal_eval(ln))\n        except Exception:\n            try:\n                vals.append(json.loads(ln))\n            except Exception:\n                # keep raw string or int\n                try:\n                    vals.append(int(ln))\n                except Exception:\n                    vals.append(ln)\n    return vals\n\n__RAW = json.loads(${inputJsonLiteral})\n__ARGS = __RAW if isinstance(__RAW, list) else __parse_inputs(__RAW)\n\n_result = None\ntry:\n    try:\n        _solver = Solution()\n        _fn = getattr(_solver, _def_name)\n        _result = _fn(*__ARGS)\n    except Exception:\n        # Try top-level function\n        _result = globals()[_def_name](*__ARGS)\nexcept Exception as e:\n    import sys\n    print(str(e), file=sys.stderr)\n    raise\n\ntry:\n    print(json.dumps(_result))\nexcept Exception:\n    print(str(_result))\n`;

    return `${userCode}\n${harness}`;
  }

  // Build a JavaScript harness that calls user's function/class with parsed inputs
  buildJavaScriptExecutable(userCode, testInputString) {
    const inputJsonLiteral = JSON.stringify(String(testInputString || ''));
    // Try to detect class Solution method or top-level function name
    let funcName = 'solution';
    const classMethodMatch = userCode.match(/class\s+Solution[\s\S]*?(\w+)\s*\(/);
    if (classMethodMatch) {
      funcName = classMethodMatch[1];
    } else {
      const defMatch = userCode.match(/function\s+(\w+)\s*\(/);
      if (defMatch) funcName = defMatch[1];
    }

  const harness = `\n\n// === Codester Harness (auto-generated) ===\nfunction __parseInputs(s) {\n  try {\n    const data = JSON.parse(s);\n    if (Array.isArray(data)) return data;\n  } catch (_) {}\n  const vals = [];\n  for (const ln of s.replace(/\\r/g, '').split('\\n').map(x => x.trim()).filter(Boolean)) {\n    try { vals.push(JSON.parse(ln)); }\n    catch (_) {\n      const n = Number(ln);\n      if (!Number.isNaN(n)) vals.push(n); else vals.push(ln);\n    }\n  }\n  return vals;\n}\n\nconst __RAW = ${JSON.stringify(String(testInputString || ''))};\nconst __ARGS = __parseInputs(__RAW);\n\nlet __result;\ntry {\n  if (typeof Solution === 'function') {\n    const _solver = new Solution();\n    if (typeof _solver[${JSON.stringify(funcName)}] === 'function') {\n      __result = _solver[${JSON.stringify(funcName)}](...__ARGS);\n    } else {\n      // fall back to top-level function\n      __result = (globalThis[${JSON.stringify(funcName)}] || eval(${JSON.stringify(funcName)}))(...__ARGS);\n    }\n  } else {\n    __result = (globalThis[${JSON.stringify(funcName)}] || eval(${JSON.stringify(funcName)}))(...__ARGS);\n  }\n} catch (e) {\n  console.error(String(e));\n  throw e;\n}\n\ntry {\n  console.log(JSON.stringify(__result));\n} catch (_) {\n  console.log(String(__result));\n}\n`;

    return `${userCode}\n${harness}`;
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
    // Direct deep-compare if expected is array/object
    if (expected && (Array.isArray(expected) || typeof expected === 'object')) {
      const aStr = (actual ?? '').toString().trim();
      try {
        let aj;
        try {
          aj = JSON.parse(aStr);
        } catch (_) {
          aj = JSON.parse(aStr.replace(/'/g, '"'));
        }
        return JSON.stringify(aj) === JSON.stringify(expected);
      } catch (_) {
        return false;
      }
    }

    const a = (actual ?? '').toString().trim();
    const e = (expected ?? '').toString().trim();

    // Numeric compare
    if (!isNaN(Number(e)) && !isNaN(Number(a))) {
      return Number(a) === Number(e);
    }

    // Try JSON/array/object compare when expected is a JSON string
    const looksJson = (s) => (s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'));
    if (looksJson(e)) {
      try {
        const ej = JSON.parse(e);
        let aj;
        try {
          aj = JSON.parse(a);
        } catch (_) {
          // Try to coerce Python repr like "[1, 2]" by replacing single quotes
          aj = JSON.parse(a.replace(/'/g, '"'));
        }
        return JSON.stringify(aj) === JSON.stringify(ej);
      } catch (_) {
        // fall through to string compare
      }
    }

    return a === e;
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
