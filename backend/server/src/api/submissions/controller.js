// In-memory storage for demo purposes
let submissions = [];
let submissionId = 1;

// Sample test cases for evaluation (in a real app, these would come from the database)
const testCases = {
  1: [ // Two Sum
    { input: [2, 7, 11, 15], target: 9, output: [0, 1] },
    { input: [3, 2, 4], target: 6, output: [1, 2] },
    { input: [3, 3], target: 6, output: [0, 1] }
  ],
  2: [ // Valid Parentheses
    { input: "()", output: true },
    { input: "()[]{}", output: true },
    { input: "(]", output: false },
    { input: "([)]", output: false }
  ],
  3: [ // Merge Sorted Array
    { input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }, output: [1, 2, 2, 3, 5, 6] }
  ],
  4: [ // Binary Tree Inorder Traversal
    { input: [1, null, 2, 3], output: [1, 3, 2] }
  ],
  5: [ // Longest Palindromic Substring
    { input: "babad", output: "bab" },
    { input: "cbbd", output: "bb" }
  ],
  6: [ // Regular Expression Matching
    { input: { s: "aa", p: "a" }, output: false },
    { input: { s: "aa", p: "a*" }, output: true }
  ]
};

// Simple code evaluation function (in a real app, this would use Docker containers)
const evaluateCode = (code, language, problemId) => {
  const cases = testCases[problemId];
  if (!cases) {
    return { status: 'Error', message: 'No test cases found for this problem' };
  }

  try {
    // For demo purposes, we'll do a simple evaluation
    // In a real implementation, this would execute the code in a sandbox
    
    let passedTests = 0;
    let totalTests = cases.length;
    let errorMessage = '';

    // Simple validation based on problem ID
    switch (problemId) {
      case 1: // Two Sum
        if (code.includes('twoSum') && code.includes('return')) {
          passedTests = totalTests;
        } else {
          errorMessage = 'Function should be named twoSum and return an array';
        }
        break;
      case 2: // Valid Parentheses
        if (code.includes('isValid') && code.includes('return')) {
          passedTests = totalTests;
        } else {
          errorMessage = 'Function should be named isValid and return a boolean';
        }
        break;
      case 3: // Merge Sorted Array
        if (code.includes('merge') && code.includes('nums1')) {
          passedTests = totalTests;
        } else {
          errorMessage = 'Function should merge arrays into nums1';
        }
        break;
      default:
        if (code.length > 10) {
          passedTests = totalTests;
        } else {
          errorMessage = 'Code seems incomplete';
        }
    }

    if (passedTests === totalTests) {
      return { 
        status: 'Accepted', 
        message: `All ${totalTests} test cases passed!`,
        passedTests,
        totalTests
      };
    } else {
      return { 
        status: 'Wrong Answer', 
        message: errorMessage || `Failed ${totalTests - passedTests} test cases`,
        passedTests,
        totalTests
      };
    }
  } catch (error) {
    return { 
      status: 'Runtime Error', 
      message: error.message,
      passedTests: 0,
      totalTests: cases.length
    };
  }
};

exports.submit = async (req, res) => {
  try {
    const { problemId, code, language, userId } = req.body;
    
    if (!problemId || !code || !language) {
      return res.status(400).json({ 
        message: 'Missing required fields: problemId, code, language' 
      });
    }

    // Evaluate the code
    const result = evaluateCode(code, language, problemId);
    
    // Create submission record (in-memory)
    const submission = {
      id: submissionId++,
      user: userId || 'demo-user',
      problem: problemId,
      code,
      language,
      verdict: result.status,
      message: result.message,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      submittedAt: new Date()
    };

    submissions.push(submission);

    res.status(201).json({
      status: result.status,
      message: result.message,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      submissionId: submission.id
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      message: 'Failed to process submission',
      error: error.message 
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  const userSubmissions = submissions.filter(s => s.user === req.params.id);
  res.json(userSubmissions);
};

exports.getProblemSubmissions = async (req, res) => {
  const problemSubmissions = submissions.filter(s => s.problem === parseInt(req.params.id));
  res.json(problemSubmissions);
}; 