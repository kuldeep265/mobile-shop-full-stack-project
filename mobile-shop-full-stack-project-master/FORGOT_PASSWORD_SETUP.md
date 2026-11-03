# Forgot Password & OTP Setup Guide

This guide explains how to set up and use the forgot password functionality with both email reset links and OTP verification.

## Features Implemented

✅ **Email Reset Link** - Traditional password reset via email link
✅ **OTP Verification** - 6-digit OTP sent to email for password reset
✅ **Secure Token Generation** - Cryptographically secure tokens and OTPs
✅ **Email Templates** - Professional HTML email templates
✅ **Expiration Handling** - 10-minute expiration for OTPs and tokens
✅ **Input Validation** - Comprehensive validation for all inputs

## Email Configuration

### Step 1: Set up Email Service

You need to configure email settings in your `.env` file:

```env
# Email Configuration (for OTP and password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Step 2: Gmail App Password Setup

If using Gmail, you need to create an App Password:

1. **Enable 2-Factor Authentication** on your Google account
2. **Go to Google Account Settings** → Security → 2-Step Verification
3. **Generate App Password**:
   - Go to "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASS` in your .env file

### Alternative Email Providers

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your_email@yahoo.com
EMAIL_PASS=your_app_password
```

## API Endpoints

### 1. Send Reset Link (Traditional Method)

**POST** `/api/auth/forgotpassword`

```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### 2. Send OTP (New Method)

**POST** `/api/auth/send-otp`

```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "us***@example.com"
}
```

### 3. Verify OTP

**POST** `/api/auth/verify-otp`

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "abc123def456..."
}
```

### 4. Reset Password with OTP

**POST** `/api/auth/reset-password-with-otp`

```json
{
  "resetToken": "abc123def456...",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "message": "Password reset successful",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### 5. Reset Password with Link (Existing)

**PUT** `/api/auth/resetpassword/:resettoken`

```json
{
  "password": "newpassword123"
}
```

## Frontend Implementation Examples

### 1. Forgot Password Form

```jsx
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState('otp'); // 'otp' or 'link'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const endpoint = method === 'otp' ? '/api/auth/send-otp' : '/api/auth/forgotpassword';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (method === 'otp') {
          // Redirect to OTP verification page
          navigate('/verify-otp', { state: { email } });
        } else {
          // Show success message for email link
          alert('Reset link sent to your email!');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      
      <div>
        <label>
          <input
            type="radio"
            value="otp"
            checked={method === 'otp'}
            onChange={(e) => setMethod(e.target.value)}
          />
          Send OTP to Email
        </label>
        <label>
          <input
            type="radio"
            value="link"
            checked={method === 'link'}
            onChange={(e) => setMethod(e.target.value)}
          />
          Send Reset Link to Email
        </label>
      </div>
      
      <button type="submit">
        {method === 'otp' ? 'Send OTP' : 'Send Reset Link'}
      </button>
    </form>
  );
};
```

### 2. OTP Verification Form

```jsx
const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState(1); // 1: verify OTP, 2: reset password
  const location = useLocation();
  const email = location.state?.email;

  const verifyOTP = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResetToken(data.resetToken);
        setStep(2);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/reset-password-with-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password: newPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store token and redirect to dashboard
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={verifyOTP}>
        <h2>Enter OTP</h2>
        <p>We sent a 6-digit code to {email}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
    );
  }

  return (
    <form onSubmit={resetPassword}>
      <h2>Reset Password</h2>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
        minLength="6"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
};
```

## Security Features

### 1. **Secure Token Generation**
- Uses `crypto.randomBytes()` for cryptographically secure tokens
- Tokens are hashed before storage using SHA-256

### 2. **Time-based Expiration**
- OTPs expire after 10 minutes
- Reset tokens expire after 10-15 minutes
- Expired tokens are automatically invalidated

### 3. **Rate Limiting** (Recommended)
Add rate limiting to prevent spam:

```javascript
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many OTP requests, please try again later.'
});

router.post('/send-otp', otpLimiter, /* ... */);
```

### 4. **Input Validation**
- Email format validation
- OTP length validation (exactly 6 digits)
- Password strength requirements

## Email Templates

The system sends professional HTML emails with:
- Branded styling
- Clear OTP display
- Security warnings
- Expiration notices

## Troubleshooting

### Common Issues:

1. **"Email could not be sent"**
   - Check EMAIL_HOST, EMAIL_PORT settings
   - Verify EMAIL_USER and EMAIL_PASS credentials
   - Ensure 2FA is enabled for Gmail and app password is used

2. **"Invalid or expired OTP"**
   - OTP expires after 10 minutes
   - Ensure OTP is entered exactly as received
   - Check for typos in email address

3. **"User not found"**
   - Verify email address exists in database
   - Check email case sensitivity

### Testing:

1. **Test email configuration:**
   ```bash
   # Send test email
   curl -X POST http://localhost:5000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Check email logs:**
   - Monitor server console for email sending logs
   - Check spam folder if emails not received

## Production Considerations

1. **Use environment-specific email templates**
2. **Implement proper logging for security events**
3. **Add rate limiting to prevent abuse**
4. **Use HTTPS for all password reset flows**
5. **Consider SMS OTP as backup option**
6. **Implement account lockout after multiple failed attempts**

## Next Steps

- Add SMS OTP functionality
- Implement account recovery questions
- Add email verification for new accounts
- Create admin panel for monitoring reset attempts