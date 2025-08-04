// MongoDB Connection Test Script
const mongoose = require('mongoose');
require('dotenv').config();

const testMongoConnection = async () => {
  console.log('🔄 Testing MongoDB Connection...');
  console.log('='.repeat(50));
  
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.log('❌ MONGO_URI environment variable not found');
    return;
  }
  
  // Mask password for logging
  const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  console.log('📡 Connection URI:', maskedUri);
  console.log('🔢 URI Length:', mongoUri.length);
  console.log('🏷️  Protocol:', mongoUri.startsWith('mongodb+srv') ? 'Atlas (SRV)' : 'Standard');
  
  try {
    console.log('\n🔄 Attempting connection...');
    
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('🏠 Host:', connection.connection.host);
    console.log('🗄️  Database:', connection.connection.name);
    console.log('📊 Ready State:', connection.connection.readyState);
    
    // Test a simple operation
    console.log('\n🔄 Testing database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.length);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting steps:');
      console.log('   1. Check if MongoDB Atlas cluster is running');
      console.log('   2. Verify network access allows 0.0.0.0/0');
      console.log('   3. Confirm DNS resolution is working');
      console.log('   4. Try connecting from MongoDB Compass');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication issue:');
      console.log('   1. Check username and password in connection string');
      console.log('   2. Verify database user exists in MongoDB Atlas');
      console.log('   3. Ensure user has proper permissions');
    }
  }
  
  process.exit(0);
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the test
testMongoConnection();
