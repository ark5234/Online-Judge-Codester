const DirectExecutionService = require('./DirectExecutionService');

// Test the direct execution with a simple Two Sum problem
async function testDirectExecution() {
  console.log('🧪 Testing Direct Execution Service...\n');
  
  const directExecutor = new DirectExecutionService();
  
  // Mock problem data (Two Sum)
  const testProblem = {
    _id: 'test123',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] }
    ]
  };

  // Test JavaScript
  const jsCode = `
function twoSum(nums, target) {
    const numMap = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in numMap) {
            return [numMap[complement], i];
        }
        numMap[nums[i]] = i;
    }
    return [];
}

// Test execution
const args = process.argv.slice(2);
if (args.length >= 2) {
    const nums = JSON.parse(args[0]);
    const target = parseInt(args[1]);
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
}
`;

  // Mock the Problem.findById
  const mockProblem = {
    findById: () => Promise.resolve(testProblem)
  };
  
  // Temporarily replace the require
  require.cache[require.resolve('../models/Problem')] = {
    exports: mockProblem
  };

  try {
    const result = await directExecutor.evaluateSubmission('test123', jsCode, 'javascript', 'testuser');
    console.log('📊 Results:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testDirectExecution();
}

module.exports = testDirectExecution;
