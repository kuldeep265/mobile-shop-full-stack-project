
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify(err =>
    console.log(err ? 'Email configuration error: ' + err.message
      : 'Email server is ready to send messages')
  );
} else {
  console.log('Email skipped: EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set');
}

// Reusable helpers
const hash = value =>
  crypto.createHash('sha256').update(value).digest('hex');

const generateToken = () => crypto.randomBytes(20).toString('hex');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const serverError = (res, error) =>
  res.status(500).json({ message: 'Server error', error: error.message });

const userData = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const findResetUser = token => User.findOne({
  resetPasswordToken: hash(token),
  resetPasswordExpire: { $gt: Date.now() }
});

const setResetToken = (user, token, minutes = 10) => {
  user.resetPasswordToken = hash(token);
  user.resetPasswordExpire = Date.now() + minutes * 60 * 1000;
};

const clearReset = user => {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpire = undefined;
};

const sendResetEmail = (user, subject, text, html) =>
  transporter.sendMail({
    to: user.email, subject, text, ...(html ? { html } : {})
  });

const emailValidation = body('email')
  .isEmail().withMessage('Please include a valid email');

const passwordValidation = body('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name should contain only letters and spaces'),
  emailValidation,
  passwordValidation
], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const { name, password } = req.body;
    const email = req.body.email.toLowerCase().trim();

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Never allow public registration to create an admin account.
    const user = await User.create({ name, email, password, role: 'customer' });
    const token = user.getSignedJwtToken();

    res.status(201).json({ success: true, token, user: userData(user) });
  } catch (e) { serverError(res, e); }
});

// Login
router.post('/login', [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: user.getSignedJwtToken(),
      user: userData(user)
    });
  } catch (e) { serverError(res, e); }
});

// Current logged-in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      success: true,
      user: { ...userData(user), addresses: user.addresses }
    });
  } catch (e) { serverError(res, e); }
});

// Forgot password: send reset link
router.post('/forgotpassword', [emailValidation], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim()
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = generateToken();
    setResetToken(user, token);
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    try {
      await sendResetEmail(user, 'Password Reset Request',
        `You requested a password reset.\nReset link: ${url}\nThis link expires in 10 minutes.`);
      res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (e) {
      clearReset(user);
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (e) { serverError(res, e); }
});

// Send password-reset OTP
router.post('/send-otp', [emailValidation], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim()
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordOTP = hash(otp);
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const text = `Your password reset OTP is: ${otp}\nThis OTP expires in 10 minutes.\nIf you didn't request this, ignore this email.`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2>Password Reset OTP</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="background:#f4f4f4;padding:20px;text-align:center;letter-spacing:5px">${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>`;

    try {
      await sendResetEmail(user, 'Password Reset OTP - Fone Factory', text, html);
      res.json({
        success: true,
        message: 'OTP sent to your email',
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
    } catch (e) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        message: 'Email could not be sent',
        error: e.message
      });
    }
  } catch (e) { serverError(res, e); }
});

// Verify OTP
router.post('/verify-otp', [
  emailValidation,
  body('otp').isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain digits only')
], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const user = await User.findOne({
      email: req.body.email.toLowerCase().trim(),
      resetPasswordOTP: hash(req.body.otp),
      resetPasswordOTPExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const token = generateToken();
    setResetToken(user, token, 15);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: token
    });
  } catch (e) { serverError(res, e); }
});

// Reset password using verified OTP token
router.post('/reset-password-with-otp', [
  body('resetToken').notEmpty().withMessage('Reset token is required'),
  passwordValidation
], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const user = await findResetUser(req.body.resetToken);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    clearReset(user);
    await user.save();

    res.json({
      success: true,
      token: user.getSignedJwtToken(),
      message: 'Password reset successful',
      user: userData(user)
    });
  } catch (e) { serverError(res, e); }
});

// Reset password using email link
router.put('/resetpassword/:resettoken', [passwordValidation], async (req, res) => {
  try {
    if (!validate(req, res)) return;

    const user = await findResetUser(req.params.resettoken);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    clearReset(user);
    await user.save();

    res.json({
      success: true,
      token: user.getSignedJwtToken(),
      message: 'Password reset successful'
    });
  } catch (e) { serverError(res, e); }
});

// Google OAuth start
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({
      error: 'Google OAuth not configured',
      message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    try {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?token=${encodeURIComponent(req.user.getSignedJwtToken())}`
      );
    } catch (e) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router;
