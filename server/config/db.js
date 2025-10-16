const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', process.env.MONGO_URI ? 
      process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 
      'Not provided'
    );
    
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('========================================');
    console.log('✅ MONGODB CONNECTED SUCCESSFULLY');
    console.log('========================================');
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🖥️  Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log(`📊 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ MONGODB CONNECTION FAILED');
    console.error('========================================');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('========================================\n');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check if MongoDB is running');
      console.log('   2. Verify MONGO_URI in .env file');
      console.log('   3. For local: Start MongoDB service');
      console.log('   4. For Atlas: Check network access\n');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;