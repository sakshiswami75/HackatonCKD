const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

require('./config/firebase'); 

console.log('========================================');
console.log('🚀 Starting Emergency Resource Sharing API');
console.log('========================================');
console.log('📝 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT || 5000);
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('🗄️  MongoDB URI:', process.env.MONGO_URI ? '✓ Loaded' : '✗ Missing');
console.log('========================================\n');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('✓ Middleware configured');
console.log('✓ CORS enabled');
console.log('✓ JSON parser enabled\n');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emergencies', require('./routes/emergencyRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

console.log('✓ Routes loaded:');
console.log('  - /api/auth');
console.log('  - /api/emergencies');
console.log('  - /api/dashboard');
console.log('  - /api/admin\n');

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Emergency Resource Sharing API is running',
    version: '1.0.0',
    status: 'OK'
  });
});

// Error handlers (should be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log(`✅ SERVER IS RUNNING`);
  console.log('========================================');
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log('========================================');
  console.log('⏰ Server started at:', new Date().toLocaleString());
  console.log('========================================\n');
  console.log('👂 Waiting for requests...\n');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server Error:', error.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.log('🔴 Shutting down server...');
  server.close(() => process.exit(1));
});