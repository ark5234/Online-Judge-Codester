const RunnerFactory = require('./Runner/RunnerFactory');

// Test individual runners
async function testRunners() {
  console.log('🧪 Testing Individual Language Runners...\n');
  
  const testCases = {
    javascript: {
      code: `
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

// Test
const result = twoSum([2, 7, 11, 15], 9);
console.log(JSON.stringify(result));
`,
      input: '',
      expected: '[0,1]'
    },
    
    python: {
      code: `
def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Test
result = two_sum([2, 7, 11, 15], 9)
print(result)
`,
      input: '',
      expected: '[0, 1]'
    },

    cpp: {
      code: `
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> numMap;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i};
        }
        numMap[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}
`,
      input: '',
      expected: '[0,1]'
    }
  };

  for (const [language, testCase] of Object.entries(testCases)) {
    console.log(`🔍 Testing ${language.toUpperCase()}...`);
    
    try {
      if (!RunnerFactory.isLanguageSupported(language)) {
        console.log(`⚠️ ${language} not supported, skipping...`);
        continue;
      }

      const runner = RunnerFactory.createRunner(language);
      const result = await runner.execute(testCase.code, testCase.input);
      
      console.log(`📊 ${language} Result:`, {
        success: result.success,
        output: result.output.trim(),
        expected: testCase.expected,
        executionTime: result.executionTime + 'ms',
        error: result.error || 'None'
      });
      
      const passed = result.output.trim() === testCase.expected.trim();
      console.log(passed ? '✅ PASSED' : '❌ FAILED');
      
    } catch (error) {
      console.log(`❌ ${language} Error:`, error.message);
    }
    
    console.log('─'.repeat(50));
  }
}

if (require.main === module) {
  testRunners();
}

module.exports = testRunners;
