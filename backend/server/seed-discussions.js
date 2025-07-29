const mongoose = require('mongoose');
const Discussion = require('./models/Discussion');
const User = require('./models/User');
require('dotenv').config();

const sampleDiscussions = [
  {
    title: "How to optimize Two Sum solution?",
    content: "I'm trying to optimize my Two Sum solution. I'm currently using a nested loop approach with O(n²) time complexity. Can anyone share their approach for achieving O(n) time complexity using a hash map? I'd love to see different implementations and understand the trade-offs.",
    tags: ["algorithms", "optimization", "hash-table"],
    authorName: "Alice Johnson"
  },
  {
    title: "Best approach for Dynamic Programming problems",
    content: "What's your strategy for approaching DP problems? I often struggle with identifying when to use dynamic programming and how to structure the solution. Looking for tips on recognizing DP patterns and common pitfalls to avoid.",
    tags: ["dynamic-programming", "algorithms", "problem-solving"],
    authorName: "Bob Smith"
  },
  {
    title: "Understanding Time Complexity",
    content: "Can someone explain Big O notation with practical examples? I understand the basics but struggle with analyzing complex algorithms. Would love to see examples of different time complexities and how to calculate them step by step.",
    tags: ["complexity", "learning", "algorithms"],
    authorName: "Charlie Brown"
  },
  {
    title: "Tips for competitive programming",
    content: "Share your best tips for competitive programming success! I'm preparing for my first competition and would love advice on time management, problem-solving strategies, and common algorithms to master. What resources do you recommend?",
    tags: ["competitive-programming", "tips", "learning"],
    authorName: "SpeedCoder"
  },
  {
    title: "Data Structures: When to use which?",
    content: "Help me understand when to use different data structures. I know about arrays, linked lists, stacks, queues, trees, and graphs, but I'm not always sure which one to choose for a given problem. What are the key factors to consider?",
    tags: ["data-structures", "algorithms", "learning"],
    authorName: "DataStruct"
  }
];

async function seedDiscussions() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codester';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get or create a sample user for discussions
    let sampleUser = await User.findOne({ email: 'sample@codester.com' });
    if (!sampleUser) {
      sampleUser = new User({
        email: 'sample@codester.com',
        name: 'Sample User',
        password: 'sample-password',
        role: 'user'
      });
      await sampleUser.save();
      console.log('✅ Created sample user');
    }

    // Clear existing discussions
    await Discussion.deleteMany({});
    console.log('✅ Cleared existing discussions');

    // Create discussions with the sample user as author
    const discussions = sampleDiscussions.map(discussion => ({
      ...discussion,
      author: sampleUser._id,
      views: Math.floor(Math.random() * 100) + 10,
      likes: [],
      replies: [],
      isActive: true
    }));

    const insertedDiscussions = await Discussion.insertMany(discussions);
    console.log(`✅ Inserted ${insertedDiscussions.length} discussions`);

    console.log('🎉 Discussions seeded successfully!');
    console.log('');
    console.log('📊 Sample Discussions:');
    insertedDiscussions.forEach((discussion, index) => {
      console.log(`   ${index + 1}. ${discussion.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding discussions:', error);
    process.exit(1);
  }
}

seedDiscussions(); 