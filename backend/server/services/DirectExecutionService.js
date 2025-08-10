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
          let rawInputString = this.getTestInputString(testCase);
          if (language.toLowerCase() === 'python' || language.toLowerCase() === 'python3') {
            const executable = this.buildPythonExecutable(code, rawInputString);
            executionResult = await runner.execute(executable, '');
            // If Python interpreter is missing on host (e.g., Render image), bail to trigger fallback strategies
            if (executionResult && executionResult.error && /ENOENT|not found/i.test(executionResult.error)) {
              throw new Error('COMPILER_MISSING: Python interpreter unavailable');
            }
          } else if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
            const executable = this.buildJavaScriptExecutable(code, rawInputString);
            executionResult = await runner.execute(executable, '');
          } else if (language.toLowerCase() === 'java') {
            const executable = this.buildJavaExecutable(code, rawInputString);
            executionResult = await runner.execute(executable, '');
            // If Java compiler is missing on host, bail to trigger fallback strategies
            if (executionResult && executionResult.error && /ENOENT|not found/i.test(executionResult.error)) {
              throw new Error('COMPILER_MISSING: Java compiler unavailable');
            }
          } else if (language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++') {
            const executable = this.buildCppExecutable(code, rawInputString);
            executionResult = await runner.execute(executable, '');
            // If C++ compiler is missing on host, bail to trigger fallback strategies
            if (executionResult && executionResult.error && /ENOENT|not found/i.test(executionResult.error)) {
              throw new Error('COMPILER_MISSING: C++ compiler unavailable');
            }
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

          if (passed) {
            console.log(`✅ Test ${i + 1}/${problem.testCases.length}: PASSED`);
          } else {
            const exp = this.getExpectedOutput(testCase);
            const act = executionResult.output;
            console.log(`❌ Test ${i + 1}/${problem.testCases.length}: FAILED`);
            console.log(`   ↪ expected: ${typeof exp === 'string' ? exp : JSON.stringify(exp)} | actual: ${act}`);
            if (executionResult.error) {
              console.log(`   ↪ stderr: ${executionResult.error.substring(0, 300)}`);
            }
            try { console.log(`   ↪ rawInput: ${rawInputString}`); } catch {}
          }

        } catch (error) {
          console.error(`❌ Test ${i + 1} execution error:`, error.message);
          // If the host lacks required compiler/interpreter, propagate error to trigger fallback strategies
          if (/COMPILER_MISSING/i.test(error.message)) {
            throw error;
          }
          // Also detect missing Python interpreter errors (ENOENT) and escalate
          if ((language.toLowerCase() === 'python' || language.toLowerCase() === 'python3') && /ENOENT|not found/i.test(error.message)) {
            throw new Error('COMPILER_MISSING: Python interpreter unavailable');
          }

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
    let funcName = 'twoSum';
    const classMethodMatch = userCode.match(/class\s+Solution[\s\S]*?def\s+(\w+)\s*\(\s*self\s*,/);
    if (classMethodMatch) {
      funcName = classMethodMatch[1];
    } else {
      const defMatch = userCode.match(/def\s+(\w+)\s*\(/);
      if (defMatch) funcName = defMatch[1];
    }

  const harness = `\n\n# === Codester Harness (auto-generated) ===\nimport json, ast, re\n\n_def_name = ${JSON.stringify(funcName)}\n\n# Provide ListNode if not defined\ntry:\n    ListNode\nexcept NameError:\n    class ListNode:\n        def __init__(self, val=0, next=None):\n            self.val = val\n            self.next = next\n\ndef __to_list(head):\n    out = []\n    cur = head\n    try:\n        while cur is not None:\n            out.append(getattr(cur, 'val'))\n            cur = getattr(cur, 'next')\n    except Exception:\n        return head\n    return out\n\ndef __from_list(arr):\n    dummy = ListNode(0)\n    cur = dummy\n    for v in arr or []:\n        cur.next = ListNode(v)\n        cur = cur.next\n    return dummy.next\n\ndef __parse_inputs(s):\n    # Try JSON first (e.g. "[[2,7,11,15], 9]" or "[1,2,3]")\n    if isinstance(s, list):\n        return s\n    text = s if isinstance(s, str) else str(s)\n    try:\n        data = json.loads(text)\n        if isinstance(data, list):\n            # If it's a flat numeric list (e.g., [1,2,3]), treat as a single argument\n            try:\n                if all(isinstance(x, (int, float)) for x in data):\n                    return [data]\n            except Exception:\n                pass\n            return data\n    except Exception:\n        pass\n    # Fallback: line-wise values (handles assignments and separators)\n    vals = []\n    for ln in [ln for ln in text.splitlines() if ln.strip()]:\n        parsed = None\n        ln_clean = re.sub(r'^\\s*(\\w+)\\s*=\\s*', '', ln)\n        try:\n            parsed = ast.literal_eval(ln_clean)\n        except Exception:\n            parsed = None\n        if parsed is None:\n            try:\n                parsed = json.loads(ln_clean)\n            except Exception:\n                parsed = None\n        if parsed is None:\n            tokens = [t for t in ln_clean.replace(',', ' ').split() if t]\n            tmp = []\n            for t in tokens:\n                numtxt = re.sub(r"[^0-9\.-]", "", t)\n                if numtxt in ('', '-', '.', '-.', '.-'):\n                    continue\n                try:\n                    if re.fullmatch(r"-?\d+", numtxt):\n                        tmp.append(int(numtxt))\n                    else:\n                        tmp.append(float(numtxt))\n                except Exception:\n                    pass\n            if tmp:\n                parsed = tmp\n        if parsed is None:\n            numtxt = re.sub(r"[^0-9\.-]", "", ln_clean)\n            if numtxt and re.fullmatch(r"-?\d+", numtxt):\n                parsed = int(numtxt)\n            else:\n                try:\n                    parsed = float(numtxt)\n                except Exception:\n                    parsed = ln_clean\n        vals.append(parsed)\n    try:\n        ints = [int(x) for x in re.findall(r'-?\\d+', text)]\n        if len(ints) >= 2:\n            return [ints[:-1], ints[-1]]\n    except Exception:\n        pass\n    return vals\n\n__RAW = ${inputJsonLiteral}\n__ARGS = __parse_inputs(__RAW)\n# Auto-convert single array arg to ListNode for common linked-list signatures\nif isinstance(__ARGS, list) and len(__ARGS) == 1 and isinstance(__ARGS[0], list):\n    __ARGS = [__from_list(__ARGS[0])]\n\n_result = None\ntry:\n    try:\n        _solver = Solution()\n        _fn = getattr(_solver, _def_name)\n        _result = _fn(*__ARGS)\n    except Exception:\n        _result = globals()[_def_name](*__ARGS)\nexcept Exception as e:\n    import sys\n    print(str(e), file=sys.stderr)\n    raise\n\ntry:\n    if hasattr(_result, 'val') and hasattr(_result, 'next'):\n        print(json.dumps(__to_list(_result)))\n    else:\n        print(json.dumps(_result))\nexcept Exception:\n    try:\n        print(json.dumps(__to_list(_result)))\n    except Exception:\n        print(str(_result))\n`;

    return `${userCode}\n${harness}`;
  }

  // Build a JavaScript harness that calls user's function/class with parsed inputs
  buildJavaScriptExecutable(userCode, testInputString) {
    const inputJsonLiteral = JSON.stringify(String(testInputString || ''));
    // Try to detect class Solution method or top-level function name
    let funcName = 'twoSum';
    const classMethodMatch = userCode.match(/class\s+Solution[\s\S]*?(\w+)\s*\(/);
    if (classMethodMatch) {
      funcName = classMethodMatch[1];
    } else {
      const defMatch = userCode.match(/function\s+(\w+)\s*\(/);
      if (defMatch) funcName = defMatch[1];
      else {
        const varMatch = userCode.match(/\b(?:const|let|var)\s+(\w+)\s*=\s*\(?\w*\s*=>/);
        if (varMatch) funcName = varMatch[1];
      }
    }

  const harness = `\n\n// === Codester Harness (auto-generated) ===\nfunction __parseInputs(s) {\n  try {\n    const data = JSON.parse(s);\n    if (Array.isArray(data)) {\n      // If it's a flat numeric array (e.g., [1,2,3]), treat as a single argument\n      const flatNums = data.every(x => typeof x === 'number');\n      return flatNums ? [data] : data;\n    }\n  } catch (_) {}\n  const vals = [];\n  for (const ln of s.replace(/\\r/g, '').split('\\n').map(x => x.trim()).filter(Boolean)) {\n    try { vals.push(JSON.parse(ln)); }\n    catch (_) {\n      const n = Number(ln);\n      if (!Number.isNaN(n)) vals.push(n); else vals.push(ln);\n    }\n  }\n  return vals;\n}\n\n// Linked list helpers\nfunction ListNode(val, next){ this.val = val; this.next = next || null; }\nfunction fromArray(arr){ const d=new ListNode(0); let c=d; for(const v of (arr||[])){ c.next=new ListNode(v); c=c.next; } return d.next; }\nfunction toArray(head){ const out=[]; let cur=head; while(cur){ out.push(cur.val); cur=cur.next; } return out; }\n\nconst __RAW = ${JSON.stringify(String(testInputString || ''))};\nlet __ARGS = __parseInputs(__RAW);\n\n// Auto-convert single array arg into ListNode for common signatures\nif (Array.isArray(__ARGS) && __ARGS.length === 1 && Array.isArray(__ARGS[0])) {\n  __ARGS = [ fromArray(__ARGS[0]) ];\n}\n\nlet __result;\ntry {\n  if (typeof Solution === 'function') {\n    const _solver = new Solution();\n    if (typeof _solver[${JSON.stringify(funcName)}] === 'function') {\n      __result = _solver[${JSON.stringify(funcName)}](...__ARGS);\n    } else {\n      __result = (globalThis[${JSON.stringify(funcName)}] || eval(${JSON.stringify(funcName)}))(...__ARGS);\n    }\n  } else {\n    __result = (globalThis[${JSON.stringify(funcName)}] || eval(${JSON.stringify(funcName)}))(...__ARGS);\n  }\n} catch (e) {\n  console.error(String(e));\n  throw e;\n}\n\ntry {\n  if (__result && typeof __result === 'object' && 'val' in __result && 'next' in __result) {\n    console.log(JSON.stringify(toArray(__result)));\n  } else {\n    console.log(JSON.stringify(__result));\n  }\n} catch (_) {\n  try { console.log(JSON.stringify(toArray(__result))); } catch { console.log(String(__result)); }\n}\n`;

    return `${userCode}\n${harness}`;
  }

  // Build a Java harness that wraps user's Solution and runs with embedded input
  buildJavaExecutable(userCode, testInputString) {
    // Try to detect a method name inside class Solution (first non-constructor)
    let funcName = 'twoSum';
    const withinSolution = userCode.match(/class\s+Solution[\s\S]*?\{([\s\S]*?)\}/);
    if (withinSolution) {
      const body = withinSolution[1];
      const mm = body.match(/(?:public|protected|private)?\s+\w+[\[\]\s<>?,]*\s+(\w+)\s*\(/);
      if (mm && mm[1] && mm[1] !== 'Solution') funcName = mm[1];
    } else {
      const m = userCode.match(/\b(\w+)\s*\(\s*int\s*\[\s*]\s*\w+\s*,\s*int\s*\w+\s*\)/);
      if (m) funcName = m[1];
    }
    const raw = JSON.stringify(String(testInputString || ''));

    const harness = `\n\nimport java.lang.reflect.*;\nimport java.util.*;\n\npublic class Main {\n    static Object[] parseArgs(String s) {\n        String t = s == null ? "" : s.trim();\n        // Cases: "[[2,7,11,15], 9]", "[1,2,3]", "42", or lines with assignments\n        try {\n            int lb = t.indexOf('[');\n            int rb = t.indexOf(']');\n            if (lb >= 0 && rb > lb) {\n                // parse numbers inside first [] as int[]\n                String arr = t.substring(lb + 1, rb);\n                List<Integer> nums = new ArrayList<>();\n                for (String part : arr.split(",")) {\n                    String digits = part.replaceAll("[^-0-9]", "").trim();\n                    if (!digits.isEmpty()) nums.add(Integer.parseInt(digits));\n                }\n                int[] a = new int[nums.size()];\n                for (int i = 0; i < nums.size(); i++) a[i] = nums.get(i);\n                // target as last number after the ']' if present, else maybe single-arg\n                String after = (rb + 1 < t.length()) ? t.substring(rb + 1) : "";\n                String digits = after.replaceAll("[^-0-9]", "").trim();\n                if (!digits.isEmpty()) {\n                    int target = Integer.parseInt(digits);\n                    return new Object[]{ a, target };\n                } else {\n                    return new Object[]{ a };\n                }\n            } else {\n                // no brackets, extract ints; if 2+, treat last as target, rest as array\n                java.util.regex.Matcher m = java.util.regex.Pattern.compile("-?\\\\d+").matcher(t);\n                List<Integer> all = new ArrayList<>();\n                while (m.find()) all.add(Integer.parseInt(m.group()));\n                if (all.size() >= 2) {\n                    int target = all.get(all.size() - 1);\n                    int[] a = new int[all.size() - 1];\n                    for (int i = 0; i < all.size() - 1; i++) a[i] = all.get(i);\n                    return new Object[]{ a, target };\n                } else if (all.size() == 1) {\n                    return new Object[]{ all.get(0) };\n                }\n            }\n        } catch (Exception e) { /* ignore */ }\n        return new Object[]{};\n    }\n\n    // --- Linked-list helpers via reflection ---\n    static boolean isLinkedNodeType(Class<?> tp) {\n        try {\n            tp.getDeclaredField("next");\n            return true;\n        } catch (Exception e) { return false; }\n    }\n\n    static Object newNode(Class<?> tp, int v) throws Exception {\n        try {\n            return tp.getDeclaredConstructor(int.class).newInstance(v);\n        } catch (NoSuchMethodException e) {\n            Object inst = tp.getDeclaredConstructor().newInstance();\n            try {\n                Field valF = tp.getDeclaredField("val");\n                valF.setAccessible(true);\n                valF.set(inst, v);\n            } catch (Exception ignore) { }\n            return inst;\n        }\n    }\n\n    static Object fromArrayToListNode(Class<?> tp, int[] arr) throws Exception {\n        Object dummy = newNode(tp, 0);\n        Field nextF = tp.getDeclaredField("next"); nextF.setAccessible(true);\n        Object cur = dummy;\n        for (int x : arr) {\n            Object node = newNode(tp, x);\n            nextF.set(cur, node);\n            cur = node;\n        }\n        Object head = nextF.get(dummy);\n        nextF.set(dummy, null);\n        return head;\n    }\n\n    static List<Integer> toArrayFromListNode(Object head) {\n        List<Integer> out = new ArrayList<>();\n        if (head == null) return out;\n        try {\n            Class<?> tp = head.getClass();\n            Field nextF = tp.getDeclaredField("next"); nextF.setAccessible(true);\n            Field valF = null;\n            try { valF = tp.getDeclaredField("val"); valF.setAccessible(true); } catch (Exception ignore) {}\n            Object cur = head;\n            int guard = 0;\n            while (cur != null && guard++ < 100000) {\n                if (valF != null) out.add(((Number)valF.get(cur)).intValue());\n                cur = nextF.get(cur);\n            }\n        } catch (Exception e) { /* ignore */ }\n        return out;\n    }\n\n    static Object invokeSolution(Object sol, String name, Object[] args) throws Exception {\n        // Try to find method by name and arg count\n        Method chosen = null;\n        for (Method m : sol.getClass().getDeclaredMethods()) {\n            if (!m.getName().equals(name)) continue;\n            if (m.getParameterCount() == args.length) { chosen = m; break; }\n        }\n        if (chosen == null) {\n            // fallback: first method with matching name\n            for (Method m : sol.getClass().getDeclaredMethods()) {\n                if (m.getName().equals(name)) { chosen = m; break; }\n            }\n        }\n        if (chosen == null) throw new NoSuchMethodException(name);\n        chosen.setAccessible(true);\n        // Coerce arguments (List<Integer> -> int[] / ListNode if needed)\n        Class<?>[] types = chosen.getParameterTypes();\n        Object[] call = new Object[types.length];\n        for (int i = 0; i < types.length; i++) {\n            Class<?> tp = types[i];\n            Object v = (i < args.length ? args[i] : null);\n            if (tp.isArray() && tp.getComponentType() == int.class) {\n                if (v instanceof int[]) call[i] = v;\n                else if (v instanceof java.util.List) {\n                    java.util.List<?> L = (java.util.List<?>) v;\n                    int[] arr = new int[L.size()];\n                    for (int k=0;k<L.size();k++) arr[k] = ((Number)L.get(k)).intValue();\n                    call[i] = arr;\n                } else if (v instanceof Number) {\n                    call[i] = new int[]{ ((Number)v).intValue() };\n                } else { call[i] = new int[0]; }\n            } else if (isLinkedNodeType(tp)) {\n                // Convert int[] or List<Integer> to linked list node type\n                int[] arr = null;\n                if (v instanceof int[]) { arr = (int[]) v; }\n                else if (v instanceof java.util.List) {\n                    java.util.List<?> L = (java.util.List<?>) v;\n                    arr = new int[L.size()];\n                    for (int k=0;k<L.size();k++) arr[k] = ((Number)L.get(k)).intValue();\n                }\n                if (arr != null) {\n                    call[i] = fromArrayToListNode(tp, arr);\n                } else {\n                    call[i] = v;\n                }\n            } else if ((tp == int.class || tp == Integer.class) && v instanceof Number) {\n                call[i] = ((Number)v).intValue();\n            } else {\n                call[i] = v;\n            }\n        }\n        return chosen.invoke(sol, call);\n    }\n\n    static void printResult(Object res) {\n        if (res == null) { System.out.println("null"); return; }\n        try {\n            // Detect linked list result via 'next' field\n            Field nextF = res.getClass().getDeclaredField("next");\n            // If field exists, serialize to array\n            List<Integer> out = toArrayFromListNode(res);\n            StringBuilder sb = new StringBuilder();\n            sb.append('[');\n            for (int i=0;i<out.size();i++){ if(i>0) sb.append(','); sb.append(out.get(i)); }\n            sb.append(']');\n            System.out.println(sb.toString());\n            return;\n        } catch (Exception ignore) { }\n        if (res instanceof int[]) {\n            int[] a = (int[]) res;\n            StringBuilder sb = new StringBuilder();\n            sb.append('[');\n            for (int i=0;i<a.length;i++){ if(i>0) sb.append(','); sb.append(a[i]); }\n            sb.append(']');\n            System.out.println(sb.toString());\n        } else if (res instanceof java.util.List) {\n            java.util.List<?> L = (java.util.List<?>) res;\n            StringBuilder sb = new StringBuilder();\n            sb.append('[');\n            for (int i=0;i<L.size();i++){ if(i>0) sb.append(','); sb.append(String.valueOf(L.get(i))); }\n            sb.append(']');\n            System.out.println(sb.toString());\n        } else {\n            System.out.println(String.valueOf(res));\n        }\n    }\n\n    public static void main(String[] args) throws Exception {\n        String RAW = ` + raw + `;\n        Object[] ARGS = parseArgs(RAW);\n        Solution sol = new Solution();\n        Object out = invokeSolution(sol, "` + funcName + `", ARGS);\n        printResult(out);\n    }\n}\n`;

    // If user code already declares public class Main, don't duplicate
    if (/public\s+class\s+Main\b/.test(userCode)) return userCode;
    return `${userCode}\n${harness}`;
  }

  // Build a C++ harness that wraps user's Solution and runs with embedded input
  buildCppExecutable(userCode, testInputString) {
    const raw = String(testInputString || '');
    // Try to detect a likely method name inside class Solution
    let funcName = 'twoSum';
    const m = userCode.match(/class\s+Solution[\s\S]*?(?:vector\s*<[^>]+>\s*|int\s+|long\s+|bool\s+|string\s+)(\w+)\s*\(/i);
    if (m && m[1] && m[1] !== 'Solution') funcName = m[1];
    const rawEsc = raw.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
    const harness = `\n\n#include <bits/stdc++.h>\nusing namespace std;\n\nstruct ListNode; // forward declaration if user defined elsewhere\n\nstatic vector<int> parseNums(const string &s){\n    vector<int> v;\n    size_t lb = s.find('['), rb = s.find(']');\n    if (lb != string::npos && rb != string::npos && rb > lb){\n        string arr = s.substr(lb+1, rb-lb-1);\n        string num;\n        stringstream ss(arr);\n        while (getline(ss, num, ',')) {\n            try { v.push_back(stoi(string(std::regex_replace(num, std::regex("[^-0-9]"), "")))); } catch(...) {}\n        }\n    } else {\n        // fallback: extract all ints except last as array\n        std::regex re("-?\\\\d+");\n        auto begin = std::sregex_iterator(s.begin(), s.end(), re);\n        auto end = std::sregex_iterator();\n        vector<int> all;\n        for (auto it=begin; it!=end; ++it) { all.push_back(stoi((*it).str())); }\n        if (all.size() >= 2) v.assign(all.begin(), all.end()-1);\n        else v = all;\n    }\n    return v;\n}\n\nstatic int parseTarget(const string &s){\n    // take last number if present\n    std::regex re("-?\\\\d+");\n    auto begin = std::sregex_iterator(s.begin(), s.end(), re);\n    auto end = std::sregex_iterator();\n    int last = 0; bool has=false;\n    for (auto it=begin; it!=end; ++it) { has=true; last = stoi((*it).str()); }\n    return has ? last : 0;\n}\n\n// Overload selector: prefer (vector<int>, int) if available; else try (ListNode*) single-arg for LL problems\n\n// Preferred: function like vector<int> f(vector<int>&, int) or similar\ntemplate <typename S>\nauto callFunc(S& sol, vector<int>& nums, int target, int) -> decltype(sol.` + funcName + `(nums, target), vector<int>()) {\n    auto res = sol.` + funcName + `(nums, target);\n    return res;\n}\n\n// Fallback: function like ListNode* f(ListNode*) for linked-list problems (e.g., reverseList)\ntemplate <typename S>\nauto callFunc(S& sol, vector<int>& nums, int /*target*/, long) -> decltype(sol.` + funcName + `((ListNode*)nullptr), vector<int>()) {\n    // Build helpers locally to avoid instantiation unless this overload is selected\n    auto fromArrayLL = [](const vector<int>& a){\n        // assumes ListNode has ctor ListNode(int) and members val/next\n        ListNode dummy(0);\n        ListNode* cur = &dummy;\n        for (int v : a){ cur->next = new ListNode(v); cur = cur->next; }\n        return dummy.next;\n    };\n    auto toArrayLL = [](ListNode* h){\n        vector<int> out;\n        while(h){ out.push_back(h->val); h = h->next; }\n        return out;\n    };\n    ListNode* head = fromArrayLL(nums);\n    auto nodeRes = sol.` + funcName + `(head);\n    return toArrayLL(nodeRes);\n}\n\nint main(){\n    string RAW = R"(` + rawEsc + `)";\n    vector<int> nums = parseNums(RAW);\n    int target = parseTarget(RAW);\n    Solution sol;\n    auto res = callFunc(sol, nums, target, 0);\n    cout << "[";\n    for (size_t i=0;i<res.size();++i){ if(i) cout << ","; cout << res[i]; }\n    cout << "]";\n    return 0;\n}\n`;

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
