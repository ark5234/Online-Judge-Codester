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
          } else if (language.toLowerCase() === 'java') {
            const rawInput = this.getTestInputString(testCase);
            const executable = this.buildJavaExecutable(code, rawInput);
            executionResult = await runner.execute(executable, '');
          } else if (language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++') {
            const rawInput = this.getTestInputString(testCase);
            const executable = this.buildCppExecutable(code, rawInput);
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

  const harness = `\n\n# === Codester Harness (auto-generated) ===\nimport json, ast\n\n_def_name = ${JSON.stringify(funcName)}\n\ndef __parse_inputs(s):\n    # Try JSON array first (e.g. "[ [2,7,11,15], 9 ]")\n    if isinstance(s, list):\n        return s\n    try:\n        data = json.loads(s)\n        if isinstance(data, list):\n            return data\n    except Exception:\n        pass\n    # Fallback: line-wise values (handles "[2,7,11,15]\\n9" or "2 7 11 15\\n9")\n    text = s if isinstance(s, str) else str(s)\n    vals = []\n    for idx, ln in enumerate([ln for ln in text.splitlines() if ln.strip()]):\n        parsed = None\n        try:\n            parsed = ast.literal_eval(ln)\n        except Exception:\n            parsed = None\n        if parsed is None:\n            try:\n                parsed = json.loads(ln)\n            except Exception:\n                parsed = None\n        if parsed is None and (',' in ln or ' ' in ln):\n            tokens = [t for t in ln.replace(',', ' ').split() if t]\n            try:\n                tmp = []\n                for t in tokens:\n                    if t.lstrip('-').isdigit():\n                        tmp.append(int(t))\n                    else:\n                        tmp.append(float(t))\n                parsed = tmp\n            except Exception:\n                parsed = tokens\n        if parsed is None:\n            try:\n                parsed = int(ln)\n            except Exception:\n                try:\n                    parsed = float(ln)\n                except Exception:\n                    parsed = ln\n        vals.append(parsed)\n    return vals\n\n__RAW = json.loads(${inputJsonLiteral})\n__ARGS = __parse_inputs(__RAW)\n\n_result = None\ntry:\n    try:\n        _solver = Solution()\n        _fn = getattr(_solver, _def_name)\n        _result = _fn(*__ARGS)\n    except Exception:\n        # Try top-level function\n        _result = globals()[_def_name](*__ARGS)\nexcept Exception as e:\n    import sys\n    print(str(e), file=sys.stderr)\n    raise\n\ntry:\n    print(json.dumps(_result))\nexcept Exception:\n    print(str(_result))\n`;

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

  // Build a Java harness that wraps user's Solution and runs with embedded input
  buildJavaExecutable(userCode, testInputString) {
    // Determine method name, default twoSum
    let funcName = 'twoSum';
    const m = userCode.match(/\b(\w+)\s*\(\s*int\s*\[\s*]\s*\w+\s*,\s*int\s*\w+\s*\)/);
    if (m) funcName = m[1];
    const raw = JSON.stringify(String(testInputString || ''));

    const harness = `\n\nimport java.util.*;\n\npublic class Main {\n    static Object[] parse(String s) {\n        // Expect formats like [[2,7,11,15], 9] or lines\n        List<Integer> nums = new ArrayList<>();\n        int target = 0;\n        try {\n            String t = s.trim();\n            int lb = t.indexOf('[');\n            int rb = t.indexOf(']');\n            if (lb >= 0 && rb > lb) {\n                String arr = t.substring(lb + 1, rb);\n                for (String part : arr.split(",")) {\n                    part = part.trim();\n                    if (!part.isEmpty()) nums.add(Integer.parseInt(part));\n                }\n            }\n            int comma = t.lastIndexOf(',');\n            if (comma >= 0) {\n                String tail = t.substring(comma + 1).replaceAll("[^-0-9]", "").trim();\n                if (!tail.isEmpty()) target = Integer.parseInt(tail);\n            } else {\n                // line-wise fallback\n                String[] lines = t.split("\\r?\\n");\n                if (lines.length >= 2) {\n                    String arr = lines[0];\n                    arr = arr.replaceAll("[\\\\[\\\\]]", "");\n                    for (String part : arr.split(",| ")) {\n                        part = part.trim();\n                        if (!part.isEmpty()) nums.add(Integer.parseInt(part));\n                    }\n                    String tail = lines[1].replaceAll("[^-0-9]", "").trim();\n                    if (!tail.isEmpty()) target = Integer.parseInt(tail);\n                }\n            }\n        } catch (Exception e) { /* best effort */ }\n        int[] a = new int[nums.size()];\n        for (int i = 0; i < nums.size(); i++) a[i] = nums.get(i);\n        return new Object[]{ a, target };\n    }\n\n    public static void main(String[] args) throws Exception {\n        String RAW = ` + raw + `;\n        Object[] parsed = parse(RAW);\n        int[] nums = (int[]) parsed[0];\n        int target = (int) parsed[1];\n        Solution sol = new Solution();\n        int[] res = sol.` + funcName + `(nums, target);\n        System.out.println(Arrays.toString(res).replace(" ", ""));\n    }\n}\n`;

    // If user code already declares public class Main, don't duplicate
    if (/public\s+class\s+Main\b/.test(userCode)) return userCode;
    return `${userCode}\n${harness}`;
  }

  // Build a C++ harness that wraps user's Solution and runs with embedded input
  buildCppExecutable(userCode, testInputString) {
    const raw = String(testInputString || '');
    const rawEsc = raw.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
    const harness = `\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nstatic vector<int> parseNums(const string &s){\n    vector<int> v;\n    size_t lb = s.find('['), rb = s.find(']');\n    if (lb != string::npos && rb != string::npos && rb > lb){\n        string arr = s.substr(lb+1, rb-lb-1);\n        string num;\n        stringstream ss(arr);\n        while (getline(ss, num, ',')) {\n            try { v.push_back(stoi(string(std::regex_replace(num, std::regex("[^-0-9]"), "")))); } catch(...) {}\n        }\n    }\n    return v;\n}\n\nstatic int parseTarget(const string &s){\n    // take last number\n    int sign = 1; long long val = 0; bool has=false;\n    for (int i = (int)s.size()-1; i>=0; --i){\n        if (isdigit(s[i])){ has=true; val = (s[i]-'0') + val*10; }\n        else if (s[i]=='-'){ sign=-1; break; }\n        else if (has) break;\n    }\n    return (int)(sign * val);\n}\n\nint main(){\n    string RAW = R"(` + rawEsc + `)";\n    vector<int> nums = parseNums(RAW);\n    int target = parseTarget(RAW);\n    Solution sol;\n    auto res = sol.twoSum(nums, target);\n    cout << "[";\n    for (size_t i=0;i<res.size();++i){ if(i) cout << ","; cout << res[i]; }\n    cout << "]";\n    return 0;\n}\n`;

    // If a main already exists, return user code
    if (/\bint\s+main\s*\(/.test(userCode)) return userCode;
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
    // If expected provided as actual array/object, deep-compare
    if (expected && (Array.isArray(expected) || typeof expected === 'object')) {
      const aStr = (actual ?? '').toString().trim();
      try {
        let aj;
        try { aj = JSON.parse(aStr); }
        catch { aj = JSON.parse(aStr.replace(/'/g, '"')); }
        return JSON.stringify(aj) === JSON.stringify(expected);
      } catch { return false; }
    }

    const a = (actual ?? '').toString().trim();
    const e = (expected ?? '').toString().trim();

    // Numeric compare
    if (!isNaN(Number(e)) && !isNaN(Number(a))) {
      return Number(a) === Number(e);
    }

    // If either looks like JSON, try JSON deep compare
    const looksJson = (s) => (s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'));
    if (looksJson(e) || looksJson(a)) {
      try {
        const ej = looksJson(e) ? JSON.parse(e) : e;
        let aj = looksJson(a) ? JSON.parse(a) : a;
        if (!looksJson(a) && typeof aj === 'string') {
          aj = JSON.parse(aj.replace(/'/g, '"'));
        }
        return JSON.stringify(aj) === JSON.stringify(ej);
      } catch { /* continue */ }
    }

    // Fallback: compare numeric sequences ignoring separators
    const extractNums = (s) => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(v => Number(v));
    const ea = extractNums(e);
    const aa = extractNums(a);
    if (ea.length && aa.length) {
      return JSON.stringify(aa) === JSON.stringify(ea);
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
