import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Sample problems data (in a real app, this would come from an API)
const sampleProblems = [
  { 
    id: 1, 
    title: "Two Sum", 
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ]
  },
  { 
    id: 2, 
    title: "Reverse Linked List", 
    difficulty: "Medium",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ],
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The original list is reversed to become [5,4,3,2,1]."
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "The original list is reversed to become [2,1]."
      }
    ]
  },
  { 
    id: 3, 
    title: "Word Ladder", 
    difficulty: "Hard",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that: Every adjacent pair of words differs by a single letter, and every si for 1 <= i <= k is in wordList. Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    constraints: [
      "1 <= beginWord.length <= 10",
      "endWord.length == beginWord.length",
      "1 <= wordList.length <= 5000",
      "wordList[i].length == beginWord.length",
      "beginWord, endWord, and wordList[i] consist of lowercase English letters",
      "beginWord != endWord",
      "All the words in wordList are unique"
    ],
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: "5",
        explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
      },
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
        output: "0",
        explanation: "The endWord 'cog' is not in wordList, therefore there is no valid transformation sequence."
      }
    ]
  },
];

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
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundProblem = sampleProblems.find(p => p.id === parseInt(id));
    setProblem(foundProblem);
    
    // Set default code template based on language
    if (foundProblem) {
      setDefaultCode(language, foundProblem);
    }
  }, [id, language]);

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
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Submission received! In a real app, this would be sent to the backend for evaluation.');
    }, 2000);
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Problem Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The problem you're looking for doesn't exist.</p>
            <Link 
              to="/problems" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Problem Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{problem.title}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyBgColor(problem.difficulty)} ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            <Link 
              to="/problems" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Problems
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Description</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{problem.description}</p>
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Constraints</h2>
              </div>
              <div className="px-6 py-4">
                <ul className="space-y-2">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <span className="font-mono">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Examples</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">Example {index + 1}:</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Input: </span>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <code className="text-sm text-gray-900 dark:text-gray-100">{example.input}</code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Output: </span>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <code className="text-sm text-gray-900 dark:text-gray-100">{example.output}</code>
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

          {/* Code Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Code Editor</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>
            
            <div className="p-6">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your solution here..."
                spellCheck="false"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                </button>
                <button
                  onClick={() => setDefaultCode(language, problem)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 