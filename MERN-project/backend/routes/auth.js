const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters and spaces'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer'
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`\n🔐 Login attempt received:`);
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Password length: ${password ? password.length : 0}`);

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.log(`❌ Login failed: User not found with email: ${normalizedEmail}`);
      console.log(`   Checking all users in database...`);
      const allUsers = await User.find({}).select('email role');
      console.log(`   Total users in DB: ${allUsers.length}`);
      allUsers.forEach(u => console.log(`     - ${u.email} (${u.role})`));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ User found: ${user.email} (${user.role})`);

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Password mismatch for user: ${user.email}`);
      console.log(`   Make sure your .env ADMIN_PASSWORD matches what you're entering`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ Password verified successfully!`);

    // Log successful login for debugging (remove in production)
    console.log(`User logged in: ${user.email}, Role: ${user.role}`);

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password - Send reset link
// @access  Public
router.post('/forgotpassword', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      You are receiving this email because you requested a password reset.
      Please click on the following link to reset your password: ${resetUrl}
      This link will expire in 10 minutes.
    `;

    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        text: message
      });

      res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP for password reset
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().withMessage('Please include a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash and save OTP
    user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const message = `
      Your password reset OTP is: ${otp}
      
      This OTP will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
    `;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p>Your password reset OTP is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      console.log(`📧 Attempting to send OTP to: ${user.email}`);
      console.log(`📧 Email config - Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}`);
      console.log(`📧 Email config - User: ${process.env.EMAIL_USER}`);
      
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset OTP - Fone Factory',
        text: message,
        html: htmlMessage
      });

      console.log(`✅ OTP email sent successfully to: ${user.email}`);
      res.json({ 
        success: true, 
        message: 'OTP sent to your email',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for security
      });
    } catch (error) {
      console.error('❌ Email sending error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ 
        message: 'Email could not be sent',
        error: error.message 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and allow password reset
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOTP,
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes for password reset
    
    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken // Frontend will use this to reset password
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/reset-password-with-otp
// @desc    Reset password using verified OTP token
// @access  Public
router.post('/reset-password-with-otp', [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, password } = req.body;

    // Hash the reset token to find user
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/google
// @desc    Google OAuth
// @access  Public
router.get('/google', (req, res, next) => {
  console.log('\n🔍 Google OAuth attempt started');
  console.log('   GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here');
  console.log('   GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here');
  
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    console.log('❌ Google OAuth not configured - missing CLIENT_ID');
    return res.status(400).json({ 
      error: 'Google OAuth not configured', 
      message: 'Please set up Google OAuth credentials in your .env file. See GOOGLE_AUTH_SETUP.md for instructions.' 
    });
  }
  
  if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
    console.log('❌ Google OAuth not configured - missing CLIENT_SECRET');
    return res.status(400).json({ 
      error: 'Google OAuth not configured', 
      message: 'Please set up Google OAuth credentials in your .env file. See GOOGLE_AUTH_SETUP.md for instructions.' 
    });
  }
  
  console.log('✅ Google OAuth credentials configured, proceeding...');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  async (req, res) => {
    try {
      console.log('\n✅ Google OAuth callback successful');
      console.log('   User:', req.user?.email);
      
      const token = req.user.getSignedJwtToken();
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('❌ Error in Google OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router;

