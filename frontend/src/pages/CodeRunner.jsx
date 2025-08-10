import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Sparkles, 
  Copy, 
  X, 
  Download, 
  Upload, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Settings,
  Save,
  RefreshCw
} from "lucide-react";
import CodeEditor from "../components/CodeEditor";

// Constants for configuration
const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python', ext: 'py' },
  { value: 'javascript', label: 'JavaScript', ext: 'js' },
  { value: 'java', label: 'Java', ext: 'java' },
  { value: 'cpp', label: 'C++', ext: 'cpp' },
  { value: 'c', label: 'C', ext: 'c' },
  { value: 'csharp', label: 'C#', ext: 'cs' },
  { value: 'php', label: 'PHP', ext: 'php' },
  { value: 'ruby', label: 'Ruby', ext: 'rb' },
  { value: 'go', label: 'Go', ext: 'go' },
  { value: 'rust', label: 'Rust', ext: 'rs' }
];

const TOAST_DURATION = 4000;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Production-ready CodeRunner component with enhanced error handling,
 * performance optimization, accessibility, and user experience improvements
 */
export default function CodeRunner() {
  // Core state
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Output will appear here...");
  const [review, setReview] = useState("AI Review will appear here...");
  const [testCases, setTestCases] = useState([{ id: 1, input: '', expected: '' }]);
  const [testResults, setTestResults] = useState([]);
  
  // UI state
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editorTheme, setEditorTheme] = useState("myCustomTheme");
  const [fontSize, setFontSize] = useState(14);
  
  // Error handling state
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs
  const abortController = useRef(null);
  const autoSaveTimer = useRef(null);

  // Memoized language info
  const currentLanguage = useMemo(() => 
    SUPPORTED_LANGUAGES.find(lang => lang.value === language) || SUPPORTED_LANGUAGES[0], 
    [language]
  );

  // Enhanced toast function
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, TOAST_DURATION);
  }, []);

  // Error handler
  const handleError = useCallback((error, context = "") => {
    console.error(`Error in ${context}:`, error);
    setLastError({ message: error.message, context, timestamp: Date.now() });
    showToast(`Error: ${error.message}`, "error");
  }, [showToast]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setInterval(() => {
      try {
        localStorage.setItem("codeRunner_code", code);
        localStorage.setItem("codeRunner_language", language);
        localStorage.setItem("codeRunner_input", input);
        console.log("Auto-saved successfully");
      } catch (error) {
        console.warn("Auto-save failed:", error);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [code, language, input]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem("codeRunner_code");
      const savedLanguage = localStorage.getItem("codeRunner_language");
      const savedInput = localStorage.getItem("codeRunner_input");
      const savedTheme = localStorage.getItem("codeRunner_theme");
      const savedFontSize = localStorage.getItem("codeRunner_fontSize");
      
      if (savedCode) setCode(savedCode);
      if (savedLanguage && SUPPORTED_LANGUAGES.find(l => l.value === savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        setCode(getSampleCode("python"));
      }
      if (savedInput) setInput(savedInput);
      if (savedTheme) setEditorTheme(savedTheme);
      if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
    } catch (error) {
      handleError(error, "loading saved data");
    }
  }, [handleError]);

  // Language-specific sample code
  const getSampleCode = useCallback((lang) => {
    const samples = {
      python: `def hello_world():
    """A simple function that returns a greeting."""
    print("Hello, World!")
    return "Success"

# Test the function
result = hello_world()
print(f"Result: {result}")`,
      
      javascript: `function helloWorld() {
    // A simple function that returns a greeting
    console.log("Hello, World!");
    return "Success";
}

// Test the function
const result = helloWorld();
console.log("Result: " + result);`,
      
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        String result = helloWorld();
        System.out.println("Result: " + result);
    }
    
    public static String helloWorld() {
        return "Success";
    }
}`,
      
      cpp: `#include <iostream>
#include <string>

std::string helloWorld() {
    std::cout << "Hello, World!" << std::endl;
    return "Success";
}

int main() {
    std::string result = helloWorld();
    std::cout << "Result: " << result << std::endl;
    return 0;
}`,
      
      c: `#include <stdio.h>

const char* hello_world() {
    printf("Hello, World!\\n");
    return "Success";
}

int main() {
    const char* result = hello_world();
    printf("Result: %s\\n", result);
    return 0;
}`,
      
      csharp: `using System;

class Program {
    static void Main() {
        string result = HelloWorld();
        Console.WriteLine("Result: " + result);
    }
    
    static string HelloWorld() {
        Console.WriteLine("Hello, World!");
        return "Success";
    }
}`
    };
    return samples[lang] || samples.python;
  }, []);

  // Enhanced language switching with cleanup
  const handleLanguageChange = useCallback((e) => {
    const newLanguage = e.target.value;
    
    try {
      setLanguage(newLanguage);
      setCode(getSampleCode(newLanguage));
      localStorage.setItem("codeRunner_language", newLanguage);
      showToast(`Switched to ${SUPPORTED_LANGUAGES.find(l => l.value === newLanguage)?.label}!`);
    } catch (error) {
      handleError(error, "language switching");
    }
  }, [getSampleCode, showToast, handleError]);

  // Enhanced code execution with retry mechanism
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setOutput("Running code...");
    
    // Cancel previous request if exists
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    
    try {
      const payload = {
        language: language,
        code: code,
        input: input
      };

      const backendUrl = import.meta.env.VITE_API_URL || 
                        import.meta.env.VITE_BACKEND_URL || 
                        'https://online-judge-codester.onrender.com/api';
      
      const executeUrl = `${backendUrl}/execute`;
      
      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: abortController.current.signal,
        timeout: 30000 // 30 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        setOutput(`❌ Execution Error:\\n${result.error}`);
      } else {
        setOutput(result.output || "Code executed successfully with no output.");
      }
      
      setRetryCount(0); // Reset retry count on success
      showToast("Code executed successfully!");
      
    } catch (error) {
      if (error.name === 'AbortError') {
        setOutput("Execution cancelled.");
        return;
      }
      
      console.error('Execution error:', error);
      
      // Retry logic
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setOutput(`⚠️ Execution failed. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => handleRunCode(), 2000);
        return;
      }
      
      // Fallback to mock execution after retries
      setOutput(`❌ Execution failed after 3 attempts.\\n\\nError: ${error.message}\\n\\nNote: This might be due to network issues or server unavailability.`);
      handleError(error, "code execution");
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, input, retryCount, showToast, handleError]);

  // Enhanced AI review with better error handling
  const handleAIReview = useCallback(async () => {
    if (isReviewing) return;
    
    setIsReviewing(true);
    setReview("🤖 Analyzing your code...");
    
    try {
      const payload = {
        code: code,
        language: language
      };

      const backendUrl = import.meta.env.VITE_API_URL || 
                        'https://online-judge-codester.onrender.com/api';
      
      const aiUrl = `${backendUrl}/ai/review`;
      
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 45000 // 45 second timeout for AI
      });
      
      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }
      
      const result = await response.json();
      setReview(result.review || "AI review completed successfully.");
      showToast("AI review completed!");
      
    } catch (error) {
      console.error('AI review error:', error);
      setReview(`🤖 **AI Review Unavailable**

Sorry, I couldn't analyze your code right now due to: ${error.message}

**Manual Code Review Tips:**
• Check for syntax errors and proper indentation
• Ensure variable names are descriptive
• Look for potential edge cases
• Consider performance optimizations
• Add comments for complex logic

Please try again later!`);
      handleError(error, "AI review");
    } finally {
      setIsReviewing(false);
    }
  }, [isReviewing, code, language, showToast, handleError]);

  // Utility functions
  const handleCopyOutput = useCallback(() => {
    navigator.clipboard.writeText(output)
      .then(() => showToast("Output copied to clipboard!"))
      .catch(() => showToast("Failed to copy output", "error"));
  }, [output, showToast]);

  const handleClearOutput = useCallback(() => {
    setOutput("Output cleared.");
    showToast("Output cleared!");
  }, [showToast]);

  const addTestCase = useCallback(() => {
    setTestCases(prev => [...prev, { id: Date.now(), input: '', expected: '' }]);
  }, []);

  const removeTestCase = useCallback((id) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  }, []);

  const updateTestCase = useCallback((id, field, value) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  }, []);

  const runTestCases = useCallback(async () => {
    if (testCases.length === 0) return;
    setIsRunning(true);
    setTestResults([]);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://online-judge-codester.onrender.com/api';
      const executeUrl = `${backendUrl}/execute`;
      const results = [];
      for (const tc of testCases) {
        const resp = await fetch(executeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ language, code, input: tc.input })
        });
        let ok = false, actual = '', errMsg = '';
        if (resp.ok) {
          const data = await resp.json();
          actual = (data.output || '').trim();
          errMsg = data.error || '';
          ok = errMsg ? false : actual === (tc.expected || '').trim();
        } else {
          errMsg = `HTTP ${resp.status}`;
        }
        results.push({ id: tc.id, pass: ok, actual, expected: (tc.expected || '').trim(), error: errMsg });
      }
      setTestResults(results);
      const passed = results.filter(r => r.pass).length;
      showToast(`Test Results: ${passed}/${results.length} passed`, passed === results.length ? 'success' : 'warning');
    } catch (e) {
      handleError(e, 'run test cases');
    } finally {
      setIsRunning(false);
    }
  }, [testCases, language, code, showToast, handleError]);

  const handleCopyReview = useCallback(() => {
    navigator.clipboard.writeText(review)
      .then(() => showToast("Review copied to clipboard!"))
      .catch(() => showToast("Failed to copy review", "error"));
  }, [review, showToast]);

  const handleClearReview = useCallback(() => {
    setReview("AI Review cleared.");
    showToast("Review cleared!");
  }, [showToast]);

  const handleDownloadCode = useCallback(() => {
    try {
      const element = document.createElement("a");
      const file = new Blob([code], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `code.${currentLanguage.ext}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
      showToast("Code downloaded successfully!");
    } catch (error) {
      handleError(error, "downloading code");
    }
  }, [code, currentLanguage.ext, showToast, handleError]);

  const handleUploadCode = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setCode(e.target.result);
        showToast(`File "${file.name}" uploaded successfully!`);
      } catch (error) {
        handleError(error, "uploading file");
      }
    };
    reader.onerror = () => {
      handleError(new Error("Failed to read file"), "file reading");
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [showToast, handleError]);

  const handleSaveSettings = useCallback(() => {
    try {
      localStorage.setItem("codeRunner_theme", editorTheme);
      localStorage.setItem("codeRunner_fontSize", fontSize.toString());
      showToast("Settings saved!");
      setIsSettingsOpen(false);
    } catch (error) {
      handleError(error, "saving settings");
    }
  }, [editorTheme, fontSize, showToast, handleError]);

  // Cancel execution
  const handleCancelExecution = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      setIsRunning(false);
      setOutput("Execution cancelled by user.");
      showToast("Execution cancelled!");
    }
  }, [showToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              toast.type === "error" 
                ? "bg-red-500 text-white" 
                : toast.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

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
              🚀 Professional Code Runner
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Advanced IDE with real-time execution, AI analysis, and auto-save
            </p>
            {lastError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Last error: {lastError.message} ({new Date(lastError.timestamp).toLocaleTimeString()})
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Controls */}
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
                  aria-label="Select programming language"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  title="Settings"
                  aria-label="Open settings"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Download code"
                  aria-label="Download code file"
                >
                  <Download size={16} />
                  Download
                </button>
                
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    accept={SUPPORTED_LANGUAGES.map(lang => `.${lang.ext}`).join(',')}
                    onChange={handleUploadCode}
                    className="hidden"
                    aria-label="Upload code file"
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">
                Code Editor ({currentLanguage.label})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem("codeRunner_code", code);
                      showToast("Code saved!");
                    } catch (error) {
                      handleError(error, "manual save");
                    }
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Save code"
                  aria-label="Save code manually"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => setCode(getSampleCode(language))}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Reset to sample code"
                  aria-label="Reset to sample code"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                height="100%"
                theme={editorTheme}
                options={{ fontSize }}
                onEditorError={(error) => handleError(error, "code editor")}
                loading="Loading advanced code editor..."
              />
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Test Cases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Quick Test Cases</h3>
                <button
                  onClick={addTestCase}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                >Add</button>
              </div>
              <div className="space-y-3">
                {testCases.map(tc => (
                  <div key={tc.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Input</label>
                        <textarea
                          value={tc.input}
                          onChange={e => updateTestCase(tc.id, 'input', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-2 text-sm font-mono"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Expected Output</label>
                        <textarea
                          value={tc.expected}
                          onChange={e => updateTestCase(tc.id, 'expected', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-2 text-sm font-mono"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => removeTestCase(tc.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >Remove</button>
                    </div>
                    {testResults.find(r => r.id === tc.id) && (
                      <div className="mt-2 text-sm">
                        {(() => { const r = testResults.find(r => r.id === tc.id); return r?.pass ? (
                          <span className="text-green-600">✔ Passed</span>
                        ) : (
                          <span className="text-red-600">✘ Failed {r?.error ? `(Error: ${r.error})` : ''}</span>
                        ); })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={runTestCases}
                  disabled={isRunning || testCases.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >Run Tests</button>
              </div>
            </motion.div>
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <label className="block font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">
                Input
              </label>
              <textarea
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="Enter input values for your program..."
                aria-label="Program input"
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
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Output</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyOutput}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy output"
                    aria-label="Copy output to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleClearOutput}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Clear output"
                    aria-label="Clear output"
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
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-200">AI Code Review</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReview}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy review"
                    aria-label="Copy AI review to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleClearReview}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Clear review"
                    aria-label="Clear AI review"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {isReviewing ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Loader2 size={16} className="animate-spin" />
                    AI is analyzing your code...
                  </div>
                ) : review === "AI Review will appear here..." ? (
                  <div className="text-center text-gray-500 py-4">
                    🤖 Click "AI Review" to analyze your code
                  </div>
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
              {isRunning ? (
                <button 
                  onClick={handleCancelExecution}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 bg-red-600 hover:bg-red-700 text-white"
                  aria-label="Cancel code execution"
                >
                  <X size={18} />
                  Cancel
                </button>
              ) : (
                <button 
                  onClick={handleRunCode}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl"
                  aria-label="Run code"
                >
                  <Play size={18} />
                  Run Code
                </button>
              )}
              
              <button 
                onClick={handleAIReview}
                disabled={isReviewing}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  isReviewing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                }`}
                aria-label="Get AI code review"
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

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editor Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={editorTheme}
                    onChange={e => setEditorTheme(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100"
                  >
                    <option value="myCustomTheme">Dark Theme</option>
                    <option value="vs">Light Theme</option>
                    <option value="vs-dark">VS Dark</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={e => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
