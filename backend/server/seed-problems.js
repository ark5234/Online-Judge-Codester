const mongoose = require('mongoose');
const Problem = require('./models/Problem');

const problems = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    category: "Arrays",
    tags: ["arrays", "hash-table"],
    timeLimit: 5000,
    memoryLimit: 128,
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
      { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false },
      { input: "[3,3]\n6", output: "[0,1]", isHidden: false },
      { input: "[1,2,3]\n7", output: "[]", isHidden: false }
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: [
      "Use a hash map to store the indices of the numbers.",
      "For each number, check if the complement (target - number) exists in the map.",
      "If it does, return the indices. Otherwise, add the number to the map."
    ],
    isActive: true
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Easy",
    category: "Linked List",
    tags: ["linked-list", "recursion", "iteration"],
    timeLimit: 5000,
    memoryLimit: 128,
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false },
      { input: "[1,2]", output: "[2,1]", isHidden: false },
      { input: "[]", output: "[]", isHidden: false }
    ],
    solution: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    hints: [
      "Use three pointers: prev, curr, and next.",
      "Iterate through the list, reversing the next pointer of each node.",
      "At the end, prev will be the new head."
    ],
    isActive: true
  },
  {
    title: "Word Ladder",
    description: "Given two words, beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists. Each transformation must change exactly one letter and the resulting word must be in wordList.",
    difficulty: "Hard",
    category: "Graph",
    tags: ["bfs", "graph", "string"],
    timeLimit: 10000,
    memoryLimit: 256,
    testCases: [
      { input: "hit\ncog\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", output: "5", isHidden: false },
      { input: "hit\ncog\n[\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", output: "0", isHidden: false },
      { input: "a\nc\n[\"a\",\"b\",\"c\"]", output: "2", isHidden: false }
    ],
    solution: `function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  let queue = [[beginWord, 1]];
  while (queue.length) {
    const [word, length] = queue.shift();
    if (word === endWord) return length;
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) {
        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (wordSet.has(next)) {
          queue.push([next, length + 1]);
          wordSet.delete(next);
        }
      }
    }
  }
  return 0;
}`,
    hints: [
      "Use BFS to find the shortest path.",
      "At each step, change one letter and check if the new word is in the word list.",
      "Use a queue to keep track of the current word and the transformation length."
    ],
    isActive: true
  }
];

async function seedProblems() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codester';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    await Problem.deleteMany({});
    console.log('✅ Cleared existing problems');
    
    const insertedProblems = await Problem.insertMany(problems);
    console.log(`✅ Inserted ${insertedProblems.length} problems`);
    
    console.log('🎉 Problems seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = seedProblems; 