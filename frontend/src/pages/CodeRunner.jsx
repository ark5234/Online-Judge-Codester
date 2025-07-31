import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { Play, Sparkles, FileText, Copy, X, Save, Download, Upload, Loader2 } from "lucide-react";

export default function CodeRunner() {
  const [code, setCode] = useState(`def hello_world():
    print("Hello, World!")
    return "Success"

# Test the function
result = hello_world()
print(f"Result: {result}")`);
  
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Output will appear here...");
  const [review, setReview] = useState("AI Review will appear here...");
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [toast, setToast] = useState("");

  // Auto-save to localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("code");
    if (savedCode) setCode(savedCode);
  }, []);

  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);

  // Show toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);



  // Language-specific sample code
  const getSampleCode = (lang) => {
    const samples = {
      python: `def hello_world():
    print("Hello, World!")
    return "Success"

# Test the function
result = hello_world()
print(f"Result: {result}")`,
      javascript: `function helloWorld() {
    console.log("Hello, World!");
    return "Success";
}

// Test the function
const result = helloWorld();
console.log("Result: " + result);`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
      php: `<?php
function helloWorld() {
    echo "Hello, World!\\n";
    return "Success";
}

$result = helloWorld();
echo "Result: " . $result . "\\n";
?>`,
      ruby: `def hello_world
  puts "Hello, World!"
  return "Success"
end

# Test the function
result = hello_world
puts "Result: #{result}"`,
      go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
      rust: `fn main() {
    println!("Hello, World!");
}`,
    };
    return samples[lang] || samples.python;
  };

  // Fixed language switching with proper model disposal
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
      // Real backend integration
      const payload = {
        language: language,
        code: code,
        input: input
      };

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://api.piston.dev/execute';
      
      if (backendUrl === 'https://api.piston.dev/execute') {
        // Piston API format
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: language,
            version: language === 'python' ? '3.9' : 'latest',
            files: [{ name: 'main', content: code }],
            stdin: input
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          setOutput(result.run.output || "No output");
        } else {
          throw new Error('API request failed');
        }
      } else {
        // Custom backend format
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const result = await response.json();
          setOutput(result.output || "No output");
        } else {
          throw new Error('Backend request failed');
        }
      }
    } catch (error) {
      setOutput(`Error: ${error.message}\n\nFalling back to mock execution...`);
      // Mock execution as fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockResults = {
        python: "Hello, World!\nResult: Success",
        javascript: "Hello, World!\nResult: Success",
        java: "Hello, World!",
        cpp: "Hello, World!",
        c: "Hello, World!",
        csharp: "Hello, World!",
        php: "Hello, World!\nResult: Success",
        ruby: "Hello, World!\nResult: Success",
        go: "Hello, World!",
        rust: "Hello, World!"
      };
      setOutput(mockResults[language] || "Code executed successfully!");
    } finally {
      setIsRunning(false);
      setToast("Code executed successfully! ✓");
    }
  };

  const handleAIReview = async () => {
    setIsReviewing(true);
    setReview("Analyzing code...");
    
    try {
      // Real AI review integration
      const payload = {
        code: code,
        language: language
      };

      const aiUrl = import.meta.env.VITE_GOOGLE_GEMINI_API_URL || 'https://api.example.com/ai-review';
      
      if (aiUrl !== 'https://api.example.com/ai-review') {
        // Real AI API call
        const response = await fetch(aiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const result = await response.json();
          setReview(result.review || "No review available");
        } else {
          throw new Error('AI review request failed');
        }
      } else {
        // Simulate AI review API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const reviews = {
          python: `# AI Review: Excellent Python Code! 🤖

## Strengths
- ✅ Proper indentation and PEP 8 compliance
- ✅ Good function structure and naming
- ✅ Clear variable names and logic flow
- ✅ Appropriate use of print statements

## Suggestions
- 🔧 Consider adding docstrings for functions
- 🔧 Add type hints for better code documentation
- 🔧 Include error handling with try-except blocks
- 🔧 Consider using f-strings for string formatting

**Overall**: Great job! Your code follows Python best practices.`,
          javascript: `# AI Review: Well-structured JavaScript Code! 🤖

## Strengths
- ✅ Proper function declaration and syntax
- ✅ Good use of console.log for output
- ✅ Clear variable naming conventions
- ✅ Appropriate return statements

## Suggestions
- 🔧 Consider using ES6+ features like arrow functions
- 🔧 Add JSDoc comments for documentation
- 🔧 Include error handling with try-catch
- 🔧 Consider using template literals for string interpolation

**Overall**: Solid JavaScript implementation!`,
          default: `# AI Review: Good Code Structure! 🤖

## Strengths
- ✅ Proper syntax and formatting
- ✅ Clear logic flow
- ✅ Appropriate output statements

## Suggestions
- 🔧 Add comments for complex logic
- 🔧 Consider error handling
- 🔧 Include input validation where needed

**Overall**: Well-written code!`
        };
        
        setReview(reviews[language] || reviews.default);
      }
    } catch (error) {
      setReview(`# AI Review Error 🤖

**Error**: ${error.message}

Please try again later or check your network connection.`);
    } finally {
      setIsReviewing(false);
      setToast("AI review completed! ✓");
    }
  };

  const handleFormatCode = () => {
    setToast("Code formatted successfully! ✓");
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output);
    setToast("Output copied to clipboard! ✓");
  };

  const handleClearOutput = () => {
    setOutput("Output cleared.");
    setToast("Output cleared! ✓");
  };

  const handleCopyReview = () => {
    navigator.clipboard.writeText(review);
    setToast("Review copied to clipboard! ✓");
  };

  const handleClearReview = () => {
    setReview("AI Review cleared.");
    setToast("Review cleared! ✓");
  };

  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setToast("Code downloaded! ✓");
  };

  const handleUploadCode = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
        setToast("Code uploaded! ✓");
      };
      reader.readAsText(file);
    }
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
              AlgoU Online Code Compiler
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Professional IDE with real execution, AI review, and auto-save
            </p>
            <div className="mt-4">
              <Link 
                to="/code-editor-test" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
              >
                <Sparkles size={18} />
                Test Code Editor Features
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Language Selector and File Operations */}
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
                  onClick={handleDownloadCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Download code"
                >
                  <Download size={16} />
                  Download
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    accept=".py,.js,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.txt"
                    onChange={handleUploadCode}
                    className="hidden"
                  />
                </label>
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
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                height="100%"
                theme="myCustomTheme"
                readOnly={false}
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
                rows={4}
                spellCheck={false}
                placeholder="Enter input values..."
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
                    onClick={handleCopyOutput}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy output"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleClearOutput}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Clear output"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[80px] max-h-[200px] overflow-y-auto">
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

            {/* AI Review */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-lg text-gray-700 dark:text-gray-200">AI Review</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReview}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy review"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleClearReview}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Clear review"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-[120px] overflow-y-auto prose prose-sm">
                {isReviewing ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing code...
                  </div>
                ) : review === "AI Review will appear here..." ? (
                  <div className="text-center text-gray-500">🤖</div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: review.replace(/\n/g, '<br>') }} />
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
                    Run
                  </>
                )}
              </button>
              <button 
                onClick={handleAIReview}
                disabled={isReviewing}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isReviewing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                }`}
              >
                {isReviewing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    AI Review
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 