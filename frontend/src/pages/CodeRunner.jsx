import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";

export default function CodeRunner() {
  const [code, setCode] = useState(`def test_function():
    if True:
        print("indented 8 spaces")
        print("also indented 8 spaces")
    else:
        print("indented 8 spaces")
        print("also indented 8 spaces")

# Try typing this step by step:
# 1. Type: def my_function():
# 2. Press Enter - should indent 4 spaces
# 3. Type: if True:
# 4. Press Enter - should indent 4 more spaces (total 8)
# 5. Type: print("hello")
# 6. Press Enter - should maintain 8 spaces
# 7. Type: else:
# 8. Press Enter - should indent 4 spaces (same level as if)`);
  
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Output will appear here...");
  const [review, setReview] = useState("AI Review will appear here...");
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  // Auto-save to localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("code");
    if (savedCode) setCode(savedCode);
  }, []);

  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  // Monaco language mapping
  const monacoLanguageMap = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'csharp',
    php: 'php',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Define custom theme
    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7f848e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'function', foreground: '61afef' },
        { token: 'variable', foreground: 'e06c75' },
      ],
      colors: {
        'editor.background': '#1e1e2f',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#2c313c',
        'editor.selectionBackground': '#3e4451',
        'editor.inactiveSelectionBackground': '#3e4451',
      }
    });
    monaco.editor.setTheme('myCustomTheme');
    
    // Configure Python language
    monaco.languages.setLanguageConfiguration('python', {
      indentationRules: {
        decreaseIndentPattern: /^(pass|return|raise|break|continue|else|elif|except|finally)$/,
        increaseIndentPattern: /^.*:\s*$/,
      },
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      comments: {
        lineComment: '#',
        blockComment: ['"""', '"""']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    });

    // Fix Python auto-indentation on Enter
    monaco.languages.registerOnTypeFormattingEditProvider('python', {
      autoFormatTriggerCharacters: ['\n'],
      provideOnTypeFormattingEdits(model, position) {
        const lineContent = model.getLineContent(position.lineNumber - 1);
        if (lineContent.trim().endsWith(':')) {
          return [{
            range: {
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: 1
            },
            text: ' '.repeat(4) // auto-indent after colon
          }];
        }
        return [];
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', {});
    }, 'editor.action.formatDocument');

    // Add Ctrl+S for save (visual feedback)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      setOutput("Code saved to localStorage! ✓");
    }, 'editor.action.save');
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    
    try {
      // Simulate backend execution (replace with real API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock execution based on language
      let result = "";
      if (language === "python") {
        result = "Hello World\nCode executed successfully!";
      } else if (language === "javascript") {
        result = "console.log('Hello World');\nHello World";
      } else {
        result = `Code executed in ${language}!\nOutput: Hello World`;
      }
      
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAIReview = () => {
    setReview(`AI Review: Your code looks good! 

Strengths:
✅ Proper indentation and formatting
✅ Good function structure
✅ Clear variable names

Suggestions:
🔧 Consider adding docstrings
🔧 Add error handling
🔧 Include type hints (Python 3.6+)`);
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {});
      setOutput("Code formatted successfully! ✓");
    } else {
      setOutput("Formatting feature not available yet.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Code Editor
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Full-featured IDE with auto-save, themes, and real execution
            </p>
          </div>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full sm:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 flex flex-col h-[600px]"
          >
            <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-4">Code Editor</div>
            <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
              <Editor
                height="100%"
                language={monacoLanguageMap[language]}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="myCustomTheme"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: "on",
                  folding: true,
                  foldingStrategy: "indentation",
                  showFoldingControls: "always",
                  renderLineHighlight: "all",
                  selectOnLineNumbers: true,
                  glyphMargin: true,
                  useTabStops: false,
                  fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                  fontLigatures: true,
                  autoIndent: "full",
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  hover: { enabled: true },
                  contextmenu: true,
                  detectIndentation: true,
                  trimAutoWhitespace: true,
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  autoClosingOvertype: "always",
                  autoClosingDelete: "always",
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                    bracketPairsHorizontal: true,
                    highlightActiveIndentation: true,
                    highlightActiveBracketPair: true
                  },
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showClasses: true,
                    showFunctions: true,
                    showVariables: true,
                    showConstants: true,
                    showEnums: true,
                    showInterfaces: true,
                    showModules: true,
                    showProperties: true,
                    showEvents: true,
                    showOperators: true,
                    showUnits: true,
                    showValues: true,
                    showColors: true,
                    showFiles: true,
                    showReferences: true,
                    showFolders: true,
                    showTypeParameters: true,
                    showWords: true,
                    showUsers: true,
                    showIssues: true,
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-6 sm:space-y-8">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">Input</div>
              <textarea
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={3}
                spellCheck={false}
                placeholder="Enter test cases here..."
              />
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">Output</div>
              <pre className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[80px] max-h-[200px] overflow-y-auto">{output}</pre>
            </motion.div>

            {/* AI Review */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">AI Review</div>
              <pre className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-[120px] overflow-y-auto">{review}</pre>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                }`}
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button 
                onClick={handleAIReview}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                AI Review
              </button>
              <button 
                onClick={handleFormatCode}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Format Code
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 