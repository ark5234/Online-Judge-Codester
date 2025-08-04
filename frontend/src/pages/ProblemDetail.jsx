import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageCircle, FiSend, FiLoader, FiArrowLeft } from 'react-icons/fi';
import Editor from "@monaco-editor/react";
import { apiService, API_ENDPOINTS } from '../services/appwrite';

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-600 dark:text-green-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'Hard': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

const getDifficultyBgColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 dark:bg-green-900/30';
    case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/30';
    case 'Hard': return 'bg-red-100 dark:bg-red-900/30';
    default: return 'bg-gray-100 dark:bg-gray-800';
  }
};

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiSection, setShowAiSection] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Fetch problem data from API
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.PROBLEMS}/${id}`);
        
        if (!response.ok) {
          throw new Error(`Problem not found: ${response.status}`);
        }
        
        const data = await response.json();
        setProblem(data.problem || data);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  // Set default code when problem or language changes
  useEffect(() => {
    if (problem) {
      setDefaultCode(language, problem);
    }
  }, [problem, language]);

  // Monaco Editor configuration
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme
    monaco.editor.defineTheme('myCustomTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.foreground': '#D4D4D4',
        'editor.background': '#1E1E1E',
        'editorCursor.foreground': '#AEAFAD',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });

    monaco.editor.setTheme('myCustomTheme');

    // Configure Python language
    monaco.languages.setLanguageConfiguration('python', {
      indentationRules: {
        decreaseIndentPattern: /^(pass|return|raise|break|continue|else|elif|except|finally)$/,
        increaseIndentPattern: /^.*:\s*$/,
      },
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/,
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

    // Register auto-indentation provider for Python
    monaco.languages.registerOnTypeFormattingEditProvider('python', {
      provideOnTypeFormattingEdits(model, position) {
        const text = model.getValue();
        const lines = text.split('\n');
        const currentLine = lines[position.lineNumber - 1];
        const previousLine = lines[position.lineNumber - 2] || '';

        // Auto-indent after colon
        if (currentLine.trim() === '' && previousLine.trim().endsWith(':')) {
          const indent = '    ';
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

        return [];
      }
    });

    // Register completion provider for Python
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems(model, position) {
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
            documentation: 'Define a function'
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
            insertText: 'class ${1:ClassName}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a class'
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import a module'
          },
          {
            label: 'return',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'return ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Return a value'
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
            documentation: 'Create a range of numbers'
          },
          {
            label: 'list',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'list(${1:iterable})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a list'
          },
          {
            label: 'dict',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'dict(${1:iterable})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a dictionary'
          },
          {
            label: 'set',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'set(${1:iterable})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a set'
          },
          {
            label: 'str',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'str(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert to string'
          },
          {
            label: 'int',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'int(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert to integer'
          },
          {
            label: 'float',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'float(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert to float'
          }
        ];

        return { suggestions };
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Auto-save functionality
      console.log('Code saved automatically');
    });

    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const setDefaultCode = (lang, prob) => {
    // Generate function name from problem title
    const functionName = prob.title
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .toLowerCase();
    
    // Generate parameter types based on problem examples
    let paramTypes = [];
    let returnType = '';
    
    if (prob.examples && prob.examples.length > 0) {
      const example = prob.examples[0];
      if (example.input && example.output) {
        // Try to infer types from examples
        try {
          const input = JSON.parse(example.input);
          const output = JSON.parse(example.output);
          
          if (Array.isArray(input)) {
            paramTypes.push('number[]');
          } else if (typeof input === 'number') {
            paramTypes.push('number');
          } else if (typeof input === 'string') {
            paramTypes.push('string');
          }
          
          if (Array.isArray(output)) {
            returnType = 'number[]';
          } else if (typeof output === 'number') {
            returnType = 'number';
          } else if (typeof output === 'string') {
            returnType = 'string';
          }
        } catch (e) {
          // Fallback to default types
          paramTypes = ['number[]', 'number'];
          returnType = 'number[]';
        }
      }
    }
    
    // Default types if no examples or parsing failed
    if (paramTypes.length === 0) {
      paramTypes = ['number[]', 'number'];
      returnType = 'number[]';
    }
    
    const templates = {
      javascript: `/**
 * @param {${paramTypes.join(', ')}} ${paramTypes.map((type, i) => {
   const paramNames = ['nums', 'target', 's', 'matrix', 'str', 'arr', 'val', 'key'];
   return paramNames[i] || `param${i + 1}`;
 }).join(', ')}
 * @return {${returnType}}
 */
const ${functionName} = function(${paramTypes.map((type, i) => {
  const paramNames = ['nums', 'target', 's', 'matrix', 'str', 'arr', 'val', 'key'];
  return paramNames[i] || `param${i + 1}`;
}).join(', ')}) {
    // TODO: Implement your solution here
    
    return ${returnType === 'number[]' ? '[]' : returnType === 'number' ? '0' : '""'};
};`,
      
      python: `from typing import List

class Solution:
    def ${functionName}(self, ${paramTypes.map((type, i) => {
  const paramNames = ['nums', 'target', 's', 'matrix', 'str', 'arr', 'val', 'key'];
  return paramNames[i] || `param${i + 1}`;
}).join(', ')}: ${returnType === 'number[]' ? 'List[int]' : returnType === 'number' ? 'int' : 'str'}) -> ${returnType === 'number[]' ? 'List[int]' : returnType === 'number' ? 'int' : 'str'}:
        # TODO: Implement your solution here
        
        return ${returnType === 'number[]' ? '[]' : returnType === 'number' ? '0' : '""'}`,
      
      java: `class Solution {
    public ${returnType} ${functionName}(${paramTypes.map((type, i) => {
      const paramNames = ['nums', 'target', 's', 'matrix', 'str', 'arr', 'val', 'key'];
      const paramName = paramNames[i] || `param${i + 1}`;
      return `${type} ${paramName}`;
    }).join(', ')}) {
        // TODO: Implement your solution here
        
        return ${returnType === 'number[]' ? 'new int[]{}' : returnType === 'number' ? '0' : '""'};
    }
}`,
      
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    ${returnType} ${functionName}(${paramTypes.map((type, i) => {
      const paramNames = ['nums', 'target', 's', 'matrix', 'str', 'arr', 'val', 'key'];
      const paramName = paramNames[i] || `param${i + 1}`;
      return `${type} ${paramName}`;
    }).join(', ')}) {
        // TODO: Implement your solution here
        
        return ${returnType === 'number[]' ? '{}' : returnType === 'number' ? '0' : '""'};
    }
};`
    };
    
    setCode(templates[lang] || templates.javascript);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      // For non-authenticated users, we'll use a guest submission approach
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add user info if authenticated
      if (user) {
        headers['Authorization'] = `Bearer ${user.$id}`;
        headers['x-appwrite-token'] = user.$id;
        headers['x-user-email'] = user.email;
        headers['x-user-name'] = user.name || user.email;
        headers['x-user-avatar'] = user.avatar || '';
      } else {
        // For guest users, use anonymous submission
        headers['x-guest-submission'] = 'true';
        headers['x-user-email'] = 'guest@codester.com';
        headers['x-user-name'] = 'Guest User';
        headers['x-user-avatar'] = '';
      }
      
      const response = await fetch(API_ENDPOINTS.SUBMISSIONS, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problemId: problem._id,
          language: language,
          code: code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubmissionResult({
        success: data.success,
        result: data.result
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({ 
        success: false,
        result: {
          status: 'Error',
          message: error.message || 'Failed to connect to backend. Please try again.'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAiLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add user info if authenticated
      if (user) {
        headers['Authorization'] = `Bearer ${user.$id}`;
        headers['x-appwrite-token'] = user.$id;
        headers['x-user-email'] = user.email;
        headers['x-user-name'] = user.name || user.email;
        headers['x-user-avatar'] = user.avatar || '';
      } else {
        // For guest users, use anonymous AI review
        headers['x-guest-submission'] = 'true';
        headers['x-user-email'] = 'guest@codester.com';
        headers['x-user-name'] = 'Guest User';
        headers['x-user-avatar'] = '';
      }
      
      const response = await fetch(API_ENDPOINTS.AI_REVIEW, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: aiQuestion,
          problemTitle: problem.title,
          code: code,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAiResponse(result.response);
    } catch (error) {
      console.error('AI Review error:', error);
      setAiResponse('Sorry, I cannot connect to the AI service right now. Please try again later.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Loading Problem...</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please wait while we fetch the problem details.</p>
          <Link 
            to="/problems" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Error: {error}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The problem you're looking for doesn't exist or an error occurred.</p>
            <Link 
              to="/problems" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Problem Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The problem you're looking for doesn't exist.</p>
            <Link 
              to="/problems" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Problem Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{problem.title}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyBgColor(problem.difficulty)} ${getDifficultyColor(problem.difficulty)} w-fit`}>
                {problem.difficulty}
              </span>
            </div>
            <Link 
              to="/problems" 
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Problems</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Problem Description */}
          <div className="space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Description</h2>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{problem.description}</p>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Constraints</h2>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4">
                <ul className="space-y-2">
                  {(problem.constraints || []).map((constraint, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <span className="font-mono break-all">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Examples</h2>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4">
                {(problem.examples || []).map((example, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-md p-3 sm:p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">Example {index + 1}:</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Input: </span>
                        <div className="mt-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-md overflow-x-auto">
                          <code className="text-sm text-gray-900 dark:text-gray-100 break-all">{example.input}</code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Output: </span>
                        <div className="mt-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-md overflow-x-auto">
                          <code className="text-sm text-gray-900 dark:text-gray-100 break-all">{example.output}</code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Explanation: </span>
                        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{example.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Code Editor and AI Review */}
          <div className="space-y-4 sm:space-y-6">
            {/* Code Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Code Editor</h2>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>
              
              {!user && (
                <div className="px-4 sm:px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 You're solving as a guest. Sign in to save your progress and track your submissions!
                  </p>
                </div>
              )}
              
              <div className="p-4 sm:p-6">
                <div className="h-64 sm:h-80 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage={language}
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
                      fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                      fontLigatures: true,
                      autoIndent: "full",
                      formatOnPaste: true,
                      formatOnType: true,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true
                      },
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
                      wordWrapColumn: 80,
                      wordWrapBreakAfterCharacters: " \t})]?|&,;",
                      wordWrapBreakBeforeCharacters: "{([+",
                      wordWrapMinified: true,
                      wrappingIndent: "none",
                      wrappingStrategy: "simple",
                      unicodeHighlight: {
                        ambiguousCharacters: true,
                        invisibleCharacters: false,
                        nonBasicASCII: false
                      },
                      unusualLineTerminators: "prompt",
                      wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
                      wordBasedSuggestions: "off"
                    }}
                  />
                </div>
                
                                           <div className="flex flex-col sm:flex-row gap-3 mt-4">
                             <button
                               onClick={handleSubmit}
                               disabled={isSubmitting}
                               className="flex-1 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                               {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                             </button>
                             <button
                               onClick={() => setDefaultCode(language, problem)}
                               className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                             >
                               Reset
                             </button>
                           </div>
                           
                           {/* Submission Result */}
                           {submissionResult && (
                             <div className={`mt-4 p-4 rounded-lg border ${
                               submissionResult.success 
                                 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                 : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                             }`}>
                               <div className="flex items-center justify-between">
                                 <h4 className={`font-medium ${
                                   submissionResult.success 
                                     ? 'text-green-800 dark:text-green-200' 
                                     : 'text-red-800 dark:text-red-200'
                                 }`}>
                                   {submissionResult.success ? '✅ Submission Successful' : '❌ Submission Failed'}
                                 </h4>
                                 <span className={`text-sm font-medium ${
                                   submissionResult.success 
                                     ? 'text-green-600 dark:text-green-400' 
                                     : 'text-red-600 dark:text-red-400'
                                 }`}>
                                   {submissionResult.result?.status || 'Unknown'}
                                 </span>
                               </div>
                               {submissionResult.result?.message && (
                                 <p className={`mt-2 text-sm ${
                                   submissionResult.success 
                                     ? 'text-green-700 dark:text-green-300' 
                                     : 'text-red-700 dark:text-red-300'
                                 }`}>
                                   {submissionResult.result.message}
                                 </p>
                               )}
                               {submissionResult.result?.passedTests !== undefined && (
                                 <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                   Tests Passed: {submissionResult.result.passedTests}/{submissionResult.result.totalTests}
                                 </div>
                               )}
                             </div>
                           )}
              </div>
            </div>

            {/* AI Review Section - Below Code Editor */}
            {user ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                      AI Review Assistant
                    </h2>
                    <button
                      onClick={() => setShowAiSection(!showAiSection)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {showAiSection ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showAiSection && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 Ask me anything about this problem! I can help with:
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                        <li>• Understanding the problem statement</li>
                        <li>• Explaining the approach and algorithm</li>
                        <li>• Reviewing your code and suggesting improvements</li>
                        <li>• Providing hints and tips</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <textarea
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="Ask your question here... (e.g., 'Can you explain the optimal approach for this problem?')"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                      <button
                        onClick={handleAiQuestion}
                        disabled={isAiLoading || !aiQuestion.trim()}
                        className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAiLoading ? (
                          <>
                            <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <FiSend className="w-4 h-4 mr-2" />
                            Ask AI
                          </>
                        )}
                      </button>
                    </div>
                    
                    {aiResponse && (
                      <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">AI Response:</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {aiResponse}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                      AI Review Assistant
                    </h2>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                      Premium
                    </span>
                  </div>
                </div>
                
                <div className="px-4 sm:px-6 py-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    AI Review Assistant
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Get personalized help with problem understanding, code review, and optimization tips.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Understand problem statements
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Get code review and improvements
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Receive hints and tips
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign In to Access AI Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 