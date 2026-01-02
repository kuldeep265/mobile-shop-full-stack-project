const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Passport config
require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    /\.vercel\.app$/, // Allow all Vercel deployments
    "https://localhost:3000",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
<<<<<<< HEAD
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully!');
    
    // Create admin user from environment variables if it doesn't exist
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      try {
        // Trim and lowercase the email to ensure proper format
        const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD.trim();
        const adminName = (process.env.ADMIN_NAME || 'Admin').trim();
        
        console.log('\n🔧 Admin user setup from .env:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password length: ${adminPassword ? adminPassword.length : 0} characters`);
        console.log(`   Name: ${adminName}`);
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminEmail)) {
          console.error('Invalid email format in ADMIN_EMAIL:', adminEmail);
          return;
        }
        
        // Password validation (minimum 6 characters as per User model)
        if (!adminPassword || adminPassword.length < 6) {
          console.error('Invalid password in ADMIN_PASSWORD: Password must be at least 6 characters long');
          return;
        }
        
        // Always ensure admin user exists with correct password
        // Delete existing admin if email matches to recreate fresh
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
          console.log('🔄 Found existing admin user, updating...');
          // Delete and recreate to ensure clean state
          await User.deleteOne({ email: adminEmail });
          console.log('   Removed old admin user');
        }
        
        // Create fresh admin user
        const adminUser = await User.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
=======
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fone-factory';
console.log('Connecting to MongoDB...');
mongoose.connect(mongoURI)
.then(async () => {
  console.log('MongoDB Connected');
  
  // Create admin user from environment variables if it doesn't exist
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    try {
      // Trim and lowercase the email to ensure proper format
      const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD.trim();
      const adminName = (process.env.ADMIN_NAME || 'Admin').trim();
      
      console.log('\n🔧 Admin user setup from .env:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password length: ${adminPassword ? adminPassword.length : 0} characters`);
      console.log(`   Name: ${adminName}`);
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmail)) {
        console.error('Invalid email format in ADMIN_EMAIL:', adminEmail);
        return;
      }
      
      // Password validation (minimum 6 characters as per User model)
      if (!adminPassword || adminPassword.length < 6) {
        console.error('Invalid password in ADMIN_PASSWORD: Password must be at least 6 characters long');
        return;
      }
      
      const adminExists = await User.findOne({ email: adminEmail }).select('+password');
      
      // Always ensure admin user exists with correct password
      // Delete existing admin if email matches to recreate fresh
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) {
        console.log('🔄 Found existing admin user, updating...');
        // Delete and recreate to ensure clean state
        await User.deleteOne({ email: adminEmail });
        console.log('   Removed old admin user');
      }
      
      // Create fresh admin user
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      // Verify the user was created and can login
      const verifyUser = await User.findOne({ email: adminEmail }).select('+password');
      const passwordTest = await verifyUser.matchPassword(adminPassword);
      
      if (passwordTest) {
        console.log('✅ Admin user created and verified successfully!');
        console.log('   Email:', adminUser.email);
        console.log('   Name:', adminUser.name);
        console.log('   Role:', adminUser.role);
        console.log('   Password verified: ✅');
        console.log('   📝 Login credentials:');
        console.log(`      Email: ${adminEmail}`);
        console.log(`      Password: [from your .env file]`);
      } else {
        console.error('❌ ERROR: Admin user created but password verification failed!');
        console.error('   This should not happen. Please check your User model.');
      }
    } catch (error) {
      console.error('Error creating admin user:', error.message);
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          console.error(`  ${key}: ${error.errors[key].message}`);
>>>>>>> 269670d8f0f6a267400ffb3ab683084d1411c32f
        });
        
        // Verify the user was created and can login
        const verifyUser = await User.findOne({ email: adminEmail }).select('+password');
        const passwordTest = await verifyUser.matchPassword(adminPassword);
        
        if (passwordTest) {
          console.log('✅ Admin user created and verified successfully!');
          console.log('   Email:', adminUser.email);
          console.log('   Name:', adminUser.name);
          console.log('   Role:', adminUser.role);
          console.log('   Password verified: ✅');
          console.log('   📝 Login credentials:');
          console.log(`      Email: ${adminEmail}`);
          console.log(`      Password: [from your .env file]`);
        } else {
          console.error('❌ ERROR: Admin user created but password verification failed!');
          console.error('   This should not happen. Please check your User model.');
        }
      } catch (error) {
        console.error('Error creating admin user:', error.message);
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
            console.error(`  ${key}: ${error.errors[key].message}`);
          });
        }
        console.error('Full error:', error);
      }
    } else {
      console.log('Admin credentials not found in .env file');
      console.log('Please add ADMIN_EMAIL and ADMIN_PASSWORD to your .env file');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit, let the app continue without database for now
    console.log('⚠️  Continuing without database connection...');
  }
};

connectDB();

// Socket.io for live chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/compare', require('./routes/compare'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/chat', require('./routes/chat'));

// Error handling middleware for multer and other errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size allowed is 5MB per image.',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 images allowed.',
        error: 'TOO_MANY_FILES'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: error.message
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'Invalid file type. Only image files (jpg, jpeg, png, gif, webp) are allowed.',
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  // Default error handler
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Debug endpoint to check admin email (password hidden for security)
app.get('/api/debug/admin-info', async (req, res) => {
  try {
    if (process.env.ADMIN_EMAIL) {
      const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;
      
      // Check if admin user exists in database
      const adminUser = await User.findOne({ email: adminEmail }).select('email role');
      
      let passwordTest = null;
      if (adminUser && adminPassword) {
        const userWithPassword = await User.findOne({ email: adminEmail }).select('+password');
        passwordTest = await userWithPassword.matchPassword(adminPassword);
      }
      
      res.json({
        env: {
          adminEmail: adminEmail,
          passwordSet: !!adminPassword,
          passwordLength: adminPassword ? adminPassword.length : 0,
          adminName: process.env.ADMIN_NAME || 'Admin'
        },
        database: {
          userExists: !!adminUser,
          email: adminUser ? adminUser.email : null,
          role: adminUser ? adminUser.role : null,
          passwordMatches: passwordTest
        },
        status: adminUser && passwordTest ? '✅ Ready to login' : '❌ Not ready'
      });
    } else {
      res.json({ message: 'Admin credentials not found in .env file' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Note: io instance is available within this file for socket handling

