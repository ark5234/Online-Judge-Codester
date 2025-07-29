import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMessageCircle, FiSend, FiLoader, FiArrowLeft } from 'react-icons/fi';

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

  // Fetch problem data from API
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/problems/${id}`);
        
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

  const setDefaultCode = (lang, prob) => {
    const templates = {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
    
};

// Test cases
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twoSum([3,2,4], 6)); // Expected: [1,2]
`,
      python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your solution here
    pass

# Test cases
print(twoSum([2,7,11,15], 9))  # Expected: [0,1]
print(twoSum([3,2,4], 6))      # Expected: [1,2]
`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}

// Test cases
Solution solution = new Solution();
System.out.println(Arrays.toString(solution.twoSum(new int[]{2,7,11,15}, 9))); // Expected: [0,1]
System.out.println(Arrays.toString(solution.twoSum(new int[]{3,2,4}, 6))); // Expected: [1,2]
`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        return {};
    }
};

// Test cases
int main() {
    Solution solution;
    vector<int> nums1 = {2,7,11,15};
    vector<int> result1 = solution.twoSum(nums1, 9);
    // Expected: [0,1]
    
    vector<int> nums2 = {3,2,4};
    vector<int> result2 = solution.twoSum(nums2, 6);
    // Expected: [1,2]
    
    return 0;
}`
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
      
      const response = await fetch('http://localhost:3001/api/submissions', {
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
      
      const response = await fetch('http://localhost:3001/api/ai/review', {
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
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 sm:h-80 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your solution here..."
                  spellCheck="false"
                />
                
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