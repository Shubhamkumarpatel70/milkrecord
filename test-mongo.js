const mongoose = require('mongoose');

// Test MongoDB connection
async function testConnection() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    return;
  }
  
  console.log('🔗 Testing MongoDB connection...');
  console.log('URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas whitelist');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Click "ADD IP ADDRESS"');
      console.log('3. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
    }
  }
}

testConnection(); 