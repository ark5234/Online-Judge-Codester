// Mock the Problem model BEFORE requiring the service
const mockProblemModel = {
  findById: () => Promise.resolve({
    _id: 'test123',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] }
    ]
  })
};
require.cache[require.resolve('../models/Problem')] = { exports: mockProblemModel };

const DirectExecutionService = require('./DirectExecutionService');

// Test the direct execution with a simple Two Sum problem
async function testDirectExecution() {
  console.log('🧪 Testing Direct Execution Service...\n');
  
  const directExecutor = new DirectExecutionService();
  
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

  try {
    const result = await directExecutor.evaluateSubmission('test123', jsCode, 'javascript', 'testuser');
    console.log('📊 Results:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test Python
  const pyCode = `
class Solution:
    def twoSum(self, nums, target):
        num_map = {}
        for i, num in enumerate(nums):
            comp = target - num
            if comp in num_map:
                return [num_map[comp], i]
            num_map[num] = i
        return []
`;

  try {
    const resultPy = await directExecutor.evaluateSubmission('test123', pyCode, 'python', 'testuser');
    console.log('🐍 Python Results:', JSON.stringify(resultPy, null, 2));
  } catch (error) {
    console.error('❌ Python Test failed:', error.message);
  }

  // Test Java
  const javaCode = `
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> numMap = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (numMap.containsKey(complement)) {
                return new int[] { numMap.get(complement), i };
            }
            numMap.put(nums[i], i);
        }
        return new int[] {};
    }
}
`;

  try {
    const resultJava = await directExecutor.evaluateSubmission('test123', javaCode, 'java', 'testuser');
    console.log('☕ Java Results:', JSON.stringify(resultJava, null, 2));
  } catch (error) {
    console.error('❌ Java Test failed:', error.message);
  }

  // Now test with DB-like string cases
  const mockProblemModelStr = {
    findById: () => Promise.resolve({
      _id: 'testSTR',
      testCases: [
        { input: '[[2,7,11,15], 9]', output: '[0,1]' },
        { input: '[[3,2,4], 6]', output: '[1,2]' },
        { input: '[[3,3], 6]', output: '[0,1]' },
        { input: '["1 2 3 4", 3]', output: '[0,2]' } // extra quirky format
      ]
    })
  };
  require.cache[require.resolve('../models/Problem')] = { exports: mockProblemModelStr };

  const directExecutorStr = new DirectExecutionService();
  try {
    const pyStr = await directExecutorStr.evaluateSubmission('testSTR', pyCode, 'python', 'testuser');
    console.log('🐍 Python String-IO Results:', JSON.stringify(pyStr, null, 2));
  } catch (e) {
    console.error('❌ Python String-IO Test failed:', e.message);
  }

  try {
    const javaStr = await directExecutorStr.evaluateSubmission('testSTR', javaCode, 'java', 'testuser');
    console.log('☕ Java String-IO Results:', JSON.stringify(javaStr, null, 2));
  } catch (e) {
    console.error('❌ Java String-IO Test failed:', e.message);
  }
}

if (require.main === module) {
  testDirectExecution();
}

module.exports = testDirectExecution;
