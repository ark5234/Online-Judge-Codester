import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Play, Sparkles, FileText, Copy, X, Save, Download, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function CodeEditorTest() {
  const [code, setCode] = useState(`def twosum(param1, param2):
    """
    :type param1: number[], param2: number
    :rtype: number[]
    """
    # Your solution here
    pass

# Test cases
print(twosum(nums = [2,7,11,15], target = 9)) # Expected: [0,1]
print(twosum(nums = [3,2,4], target = 6)) # Expected: [1,2]`);
  
  const [language, setLanguage] = useState("python");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("Output will appear here...");
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Show toast notification
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  // Language-specific sample code
  const getSampleCode = (lang) => {
    const samples = {
      python: `def twosum(param1, param2):
    """
    :type param1: number[], param2: number
    :rtype: number[]
    """
    # Your solution here
    pass

# Test cases
print(twosum(nums = [2,7,11,15], target = 9)) # Expected: [0,1]
print(twosum(nums = [3,2,4], target = 6)) # Expected: [1,2]`,
      javascript: `function twosum(param1, param2) {
    // Your solution here
    return [];
}

// Test cases
console.log(twosum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twosum([3,2,4], 6)); // Expected: [1,2]`,
      java: `public class Solution {
    public int[] twosum(int[] param1, int param2) {
        // Your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        System.out.println(Arrays.toString(solution.twosum(new int[]{2,7,11,15}, 9)));
        System.out.println(Arrays.toString(solution.twosum(new int[]{3,2,4}, 6)));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twosum(vector<int>& param1, int param2) {
        // Your solution here
        return {};
    }
};

int main() {
    Solution solution;
    vector<int> nums1 = {2,7,11,15};
    vector<int> nums2 = {3,2,4};
    
    auto result1 = solution.twosum(nums1, 9);
    auto result2 = solution.twosum(nums2, 6);
    
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twosum(int* param1, int param2, int* returnSize) {
    // Your solution here
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums1[] = {2,7,11,15};
    int nums2[] = {3,2,4};
    int returnSize;
    
    int* result1 = twosum(nums1, 9, &returnSize);
    int* result2 = twosum(nums2, 6, &returnSize);
    
    return 0;
}`,
      csharp: `using System;

public class Solution {
    public int[] Twosum(int[] param1, int param2) {
        // Your solution here
        return new int[]{};
    }
    
    public static void Main() {
        var solution = new Solution();
        Console.WriteLine(string.Join(",", solution.Twosum(new int[]{2,7,11,15}, 9)));
        Console.WriteLine(string.Join(",", solution.Twosum(new int[]{3,2,4}, 6)));
    }
}`,
      php: `<?php
function twosum($param1, $param2) {
    // Your solution here
    return [];
}

// Test cases
print_r(twosum([2,7,11,15], 9)); // Expected: [0,1]
print_r(twosum([3,2,4], 6)); // Expected: [1,2]
?>`,
      ruby: `def twosum(param1, param2)
  # Your solution here
  []
end

# Test cases
puts twosum([2,7,11,15], 9).inspect # Expected: [0,1]
puts twosum([3,2,4], 6).inspect # Expected: [1,2]`,
      go: `package main

import "fmt"

func twosum(param1 []int, param2 int) []int {
    // Your solution here
    return []int{}
}

func main() {
    fmt.Println(twosum([]int{2,7,11,15}, 9)) // Expected: [0,1]
    fmt.Println(twosum([]int{3,2,4}, 6)) // Expected: [1,2]
}`,
      rust: `fn twosum(param1: Vec<i32>, param2: i32) -> Vec<i32> {
    // Your solution here
    vec![]
}

fn main() {
    println!("{:?}", twosum(vec![2,7,11,15], 9)); // Expected: [0,1]
    println!("{:?}", twosum(vec![3,2,4], 6)); // Expected: [1,2]
}`,
    };
    return samples[lang] || samples.python;
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define custom theme with better contrast
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
        { token: 'type', foreground: 'e5c07b' },
        { token: 'class', foreground: 'e5c07b' },
        { token: 'operator', foreground: '56b6c2' },
        { token: 'delimiter', foreground: 'abb2bf' },
      ],
      colors: {
        'editor.background': '#1e1e2f',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#2c313c',
        'editor.selectionBackground': '#3e4451',
        'editor.inactiveSelectionBackground': '#3e4451',
        'editorCursor.foreground': '#528bff',
        'editorWhitespace.foreground': '#3b4048',
        'editorIndentGuide.background': '#3b4048',
        'editorIndentGuide.activeBackground': '#9d550fb0',
        'editor.selectionHighlightBorder': '#7f848e',
      }
    });
    
    // Set the theme
    monaco.editor.setTheme('myCustomTheme');
    
    // Configure Python language with enhanced features
    monaco.languages.setLanguageConfiguration('python', {
      indentationRules: {
        decreaseIndentPattern: /^\s*(pass|return|raise|break|continue|else|elif|except|finally)\b/,
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

    // Enhanced Python auto-indentation with smart dedent
    monaco.languages.registerOnTypeFormattingEditProvider('python', {
      autoFormatTriggerCharacters: ['\n'],
      provideOnTypeFormattingEdits(model, position) {
        const lineContent = model.getLineContent(position.lineNumber - 1).trim();
        const shouldIndent = lineContent.endsWith(':');
        const shouldDedent = /^(return|break|continue|pass|raise|else|elif|except|finally)\b/.test(lineContent);
        
        let indent = '    '; // Default 4 spaces
        
        if (shouldDedent) {
          // Decrease indentation for control flow keywords
          indent = '';
        } else if (shouldIndent) {
          // Increase indentation after colon
          indent = '        '; // 8 spaces
        } else {
          // Maintain current indentation level
          const prevLine = position.lineNumber > 1 ? model.getLineContent(position.lineNumber - 1) : '';
          const prevIndent = prevLine.match(/^\s*/)[0];
          if (prevIndent && !lineContent.match(/^\s*(else|elif|except|finally)\b/)) {
            indent = prevIndent;
          }
        }
        
        return [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: 1
          },
          text: indent
        }];
      }
    });

    // Add Python-specific completions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print a value to the console'
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:parameters}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a new function'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement'
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop'
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'while ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'While loop'
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Try-except block'
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a new class'
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import a module'
          },
          {
            label: 'from',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'from ${1:module} import ${2:item}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import specific item from module'
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Return statement'
          },
          {
            label: 'len',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'len(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get the length of an object'
          },
          {
            label: 'range',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'range(${1:start}, ${2:stop}, ${3:step})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a range object'
          }
        ];
        return { suggestions };
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', {});
      setToast("Code formatted successfully! ✓");
    }, 'editor.action.formatDocument');

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      setToast("Code saved! ✓");
    }, 'editor.action.save');

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setCode(getSampleCode(newLanguage));
    setToast(`Switched to ${newLanguage}! ✓`);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    
    try {
      // Mock execution for testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = {
        python: "None\nNone",
        javascript: "undefined\nundefined",
        java: "[I@7852e922\n[I@4e25154f",
        cpp: "",
        c: "",
        csharp: "\n",
        php: "Array\n(\n)\nArray\n(\n)",
        ruby: "[]\n[]",
        go: "[]\n[]",
        rust: "[]\n[]"
      };
      
      setOutput(mockResults[language] || "Code executed successfully!");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
      setToast("Code executed successfully! ✓");
    }
  };

  const handleSubmitSolution = async () => {
    setIsRunning(true);
    setOutput("Submitting solution...");
    
    try {
      // Mock submission for testing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate test results
      const testResults = {
        passed: 0,
        total: 3,
        status: "Wrong Answer"
      };
      
      setOutput(`Submission Successful\nTests Passed: ${testResults.passed}/${testResults.total}\nStatus: ${testResults.status}`);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
      setToast("Solution submitted! ✓");
    }
  };

  const handleAiReview = async () => {
    setIsAiLoading(true);
    setAiReview("🤖 Hello! I'm your AI coding assistant. Let me analyze your code...");
    setShowAiReview(true);
    
    try {
      // Simulate conversational AI review
      await new Promise(resolve => setTimeout(resolve, 800));
      setAiReview("🤖 Hello! I'm your AI coding assistant. Let me analyze your code...\n\n🔍 Scanning your code structure...");
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setAiReview(prev => prev + "\n\n✅ **Code Structure Analysis:**\nI can see you're working with " + language + ". Your code has a good foundation!");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setAiReview(prev => prev + "\n\n💡 **Suggestions for Improvement:**");
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const reviews = {
        python: `🤖 Hello! I'm your AI coding assistant. Let me analyze your code...

🔍 Scanning your code structure...

✅ **Code Structure Analysis:**
I can see you're working with Python. Your code has a good foundation!

💡 **Suggestions for Improvement:**

🎯 **What I noticed:**
• Your function structure looks clean and readable
• Good use of Python conventions
• Clear variable naming

🚀 **Quick improvements you could make:**
• Add docstrings to explain what your function does
• Consider using type hints for better documentation
• Maybe add some error handling with try-except blocks
• F-strings are great for string formatting in Python!

💭 **My thoughts:**
Overall, this is solid Python code! You're following good practices. The main thing is just adding some documentation to make it even more professional.

Keep up the great work! 🎉`,
        
        javascript: `🤖 Hello! I'm your AI coding assistant. Let me analyze your code...

🔍 Scanning your code structure...

✅ **Code Structure Analysis:**
I can see you're working with JavaScript. Your code has a good foundation!

💡 **Suggestions for Improvement:**

🎯 **What I noticed:**
• Your function declarations are clear and well-structured
• Good use of console.log for debugging
• Clean variable naming conventions

🚀 **Quick improvements you could make:**
• Consider using ES6+ features like arrow functions
• Add JSDoc comments to document your functions
• Maybe include some error handling with try-catch
• Template literals are awesome for string interpolation!

💭 **My thoughts:**
This is well-written JavaScript! You're following modern practices. Just a few small tweaks would make it even better.

Great job! 🎉`,
        
        default: `🤖 Hello! I'm your AI coding assistant. Let me analyze your code...

🔍 Scanning your code structure...

✅ **Code Structure Analysis:**
I can see you're working with ${language}. Your code has a good foundation!

💡 **Suggestions for Improvement:**

🎯 **What I noticed:**
• Your code structure is clean and readable
• Good use of language conventions
• Clear logic flow

🚀 **Quick improvements you could make:**
• Add comments to explain complex logic
• Consider adding error handling
• Maybe include some input validation where needed

💭 **My thoughts:**
Overall, this is well-written code! You're following good practices. Just a few small improvements would make it even better.

Keep up the great work! 🎉`
      };
      
      setAiReview(reviews[language] || reviews.default);
    } catch (error) {
      setAiReview(`🤖 **AI Review Error**

😔 Sorry, I encountered an issue while analyzing your code.

**Error**: ${error.message}

Please try again later.`);
    } finally {
      setIsAiLoading(false);
      setToast("AI review completed! ✓");
    }
  };

  const handleResetCode = () => {
    setCode(getSampleCode(language));
    setOutput("Output will appear here...");
    setToast("Code reset! ✓");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          {toast}
        </motion.div>
      )}

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
              Code Editor Test Page
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Testing Monaco Editor features and functionality
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
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="flex gap-2">
                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  title="Reset code"
                >
                  <FileText size={16} />
                  Reset
                </button>
              </div>
            </div>
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
                  // Basic editor settings
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: "on",
                  
                  // Font settings
                  fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                  fontLigatures: true,
                  
                  // Code folding
                  folding: true,
                  foldingStrategy: "indentation",
                  showFoldingControls: "always",
                  
                  // Visual features
                  renderLineHighlight: "all",
                  selectOnLineNumbers: true,
                  glyphMargin: true,
                  bracketPairColorization: { enabled: true },
                  
                  // Indentation and formatting
                  autoIndent: "full",
                  formatOnPaste: true,
                  formatOnType: true,
                  detectIndentation: true,
                  trimAutoWhitespace: true,
                  useTabStops: false,
                  
                  // Auto-closing features
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  autoClosingOvertype: "always",
                  autoClosingDelete: "always",
                  
                  // Guides and highlighting
                  guides: {
                    indentation: true,
                    bracketPairs: true,
                    bracketPairsHorizontal: true,
                    highlightActiveIndentation: true,
                    highlightActiveBracketPair: true
                  },
                  
                  // Suggestions and completions
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                  },
                  parameterHints: { enabled: true },
                  hover: { enabled: true },
                  
                  // Context menu and accessibility
                  contextmenu: true,
                  accessibilitySupport: "auto",
                  
                  // Cursor and selection
                  cursorBlinking: "blink",
                  cursorSmoothCaretAnimation: "on",
                  cursorStyle: "line",
                  
                  // Scrollbar
                  scrollbar: {
                    arrowSize: 11,
                    horizontal: "auto",
                    horizontalHasLess: false,
                    horizontalScrollbarSize: 10,
                    horizontalSliderSize: 9,
                    scrollByPage: false,
                    useShadows: true,
                    vertical: "auto",
                    verticalHasLess: false,
                    verticalScrollbarSize: 10,
                    verticalSliderSize: 7
                  },
                  
                  // Advanced features
                  inlineSuggest: {
                    enabled: true,
                    mode: "prefix",
                    suppressSuggestions: false
                  },
                  
                  // Suggest configuration
                  suggest: {
                    acceptSuggestionOnCommitCharacter: true,
                    acceptSuggestionOnEnter: "on",
                    animations: true,
                    automaticallyShowFirstSuggestion: false,
                    filterGraceful: true,
                    hideStatusBar: false,
                    insertMode: "insert",
                    localityBonus: false,
                    maxVisibleSuggestions: 12,
                    selectionMode: "whenQuickSuggestion",
                    showClasses: true,
                    showColors: true,
                    showConstants: true,
                    showConstructors: true,
                    showDeprecated: true,
                    showEnums: true,
                    showEnumsMembers: true,
                    showEvents: true,
                    showFields: true,
                    showFiles: true,
                    showFolders: true,
                    showFunctions: true,
                    showIcons: true,
                    showInterfaces: true,
                    showIssues: true,
                    showKeywords: true,
                    showMethods: true,
                    showModules: true,
                    showNamespaces: true,
                    showOperators: true,
                    showProperties: true,
                    showReferences: true,
                    showSnippets: true,
                    showStructs: true,
                    showTypeParameters: true,
                    showUnits: true,
                    showUsers: true,
                    showValues: true,
                    showVariables: true,
                    showWords: true,
                    snippetsPreventQuickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    tabCompletion: "off",
                    wordBasedSuggestions: "off"
                  },
                  
                  // Word wrap settings
                  wordWrapColumn: 80,
                  wordWrapBreakAfterCharacters: " \t})]?|&,;",
                  wordWrapBreakBeforeCharacters: "{([+",
                  wordWrapMinified: true,
                  wrappingIndent: "none",
                  wrappingStrategy: "simple",
                  
                  // Unicode and special characters
                  unicodeHighlight: {
                    ambiguousCharacters: true,
                    invisibleCharacters: false,
                    nonBasicASCII: false
                  },
                  unusualLineTerminators: "prompt",
                  
                  // Word separators
                  wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
                  wordBasedSuggestions: "off"
                }}
              />
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-6 sm:space-y-8">
            {/* Custom Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">Custom Input</div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter custom input for your code (optional)..."
                spellCheck={false}
              />
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-lg text-gray-700 dark:text-gray-200">Output</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(output);
                      setToast("Output copied to clipboard! ✓");
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy output"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setOutput("Output cleared.");
                      setToast("Output cleared! ✓");
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Clear output"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[200px] max-h-[300px] overflow-y-auto">
                {isRunning ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 size={16} className="animate-spin" />
                    Running code...
                  </div>
                ) : (
                  output
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-4"
            >
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Code
                  </>
                )}
              </button>
              <button 
                onClick={handleSubmitSolution}
                disabled={isRunning}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isRunning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Submit Solution
                  </>
                )}
              </button>
            </motion.div>

            {/* AI Review Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-lg text-gray-700 dark:text-gray-200">AI Review Assistant</div>
                <button
                  onClick={handleAiReview}
                  disabled={isAiLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isAiLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Get AI Review
                    </>
                  )}
                </button>
              </div>
              
              {showAiReview && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-[300px] overflow-y-auto prose prose-sm">
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 text-purple-600">
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing code...
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: aiReview.replace(/\n/g, '<br>') }} />
                  )}
                </div>
              )}
            </motion.div>

            {/* Test Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-lg text-gray-700 dark:text-gray-200">Test Results</div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Submission Successful</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-red-700 dark:text-red-400 font-medium">Wrong Answer</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Tests Passed: 0/3</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 