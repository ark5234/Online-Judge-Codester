const mongoose = require('mongoose');
const Problem = require('./models/Problem');
require('dotenv').config();

const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Easy",
    category: "Arrays",
    tags: ["array", "hash-table"],
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
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        description: "Basic test case"
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
        description: "Another valid solution"
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]",
        description: "Same numbers"
      }
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
    difficulty: "Easy",
    category: "Stack",
    tags: ["stack", "string"],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The string contains valid parentheses."
      },
      {
        input: 's = "([)]"',
        output: "false",
        explanation: "The string contains invalid parentheses."
      }
    ],
    testCases: [
      {
        input: "()",
        output: "true",
        description: "Simple valid case"
      },
      {
        input: "([)]",
        output: "false",
        description: "Invalid case"
      },
      {
        input: "{[]}",
        output: "true",
        description: "Valid nested case"
      }
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Merge Sorted Array",
    description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order.",
    difficulty: "Medium",
    category: "Arrays",
    tags: ["array", "two-pointers", "sorting"],
    constraints: [
      "nums1.length == m + n",
      "nums2.length == n",
      "0 <= m, n <= 200",
      "1 <= m + n <= 200",
      "-10^9 <= nums1[i], nums2[j] <= 10^9"
    ],
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]",
        explanation: "The arrays are merged and sorted."
      }
    ],
    testCases: [
      {
        input: "[1,2,3,0,0,0]\n3\n[2,5,6]\n3",
        output: "[1,2,2,3,5,6]",
        description: "Basic merge case"
      }
    ],
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codester';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('✅ Cleared existing problems');

    // Insert sample problems
    const insertedProblems = await Problem.insertMany(sampleProblems);
    console.log(`✅ Inserted ${insertedProblems.length} problems`);

    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('📊 Sample Problems:');
    insertedProblems.forEach((problem, index) => {
      console.log(`   ${index + 1}. ${problem.title} (${problem.difficulty})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 