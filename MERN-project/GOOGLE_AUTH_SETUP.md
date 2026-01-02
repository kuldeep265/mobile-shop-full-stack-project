# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your MERN project.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project (if needed)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Fone Factory Auth")
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in the required fields:
       - App name: "Fone Factory"
       - User support email: Your email
       - Developer contact information: Your email
     - Save and continue through the scopes and test users sections

5. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "Fone Factory Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `http://localhost:5000` (for backend)
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"

6. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - You'll need these for your environment variables

## Step 2: Update Environment Variables

1. **Backend (.env)**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   SESSION_SECRET=your_random_session_secret_here
   ```

2. **Generate a Session Secret**
   - You can generate a random string for SESSION_SECRET
   - Example: `openssl rand -base64 32` (if you have OpenSSL)
   - Or use any random string generator

## Step 3: Test the Implementation

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Google Authentication**
   - Go to `http://localhost:3000/login`
   - Click "Sign in with Google"
   - You should be redirected to Google's OAuth page
   - After authorization, you'll be redirected back to your app

## Features Implemented

✅ **Backend Features:**
- Google OAuth strategy with Passport.js
- User model updated to support Google authentication
- Google auth routes (`/api/auth/google` and `/api/auth/google/callback`)
- Automatic user creation/linking for Google accounts

✅ **Frontend Features:**
- Google authentication button component
- Auth success page to handle OAuth callback
- Updated login and register pages with Google auth option
- Seamless integration with existing authentication flow

✅ **Security Features:**
- JWT token generation for Google-authenticated users
- Session management for OAuth flow
- Secure redirect handling
- User data validation and sanitization

## How It Works

1. **User clicks "Sign in with Google"**
   - Redirects to `/api/auth/google`
   - Backend redirects to Google OAuth

2. **Google OAuth Flow**
   - User authorizes the application
   - Google redirects to `/api/auth/google/callback`

3. **Backend Processing**
   - Receives user data from Google
   - Checks if user exists (by Google ID or email)
   - Creates new user or links Google account to existing user
   - Generates JWT token

4. **Frontend Handling**
   - User redirected to `/auth/success?token=...`
   - AuthSuccess component extracts token
   - Fetches user data and logs user in
   - Redirects to home page

## Troubleshooting

**Common Issues:**

1. **"redirect_uri_mismatch" error**
   - Make sure your redirect URI in Google Console matches exactly: `http://localhost:5000/api/auth/google/callback`

2. **"invalid_client" error**
   - Check that your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct

3. **Session issues**
   - Make sure SESSION_SECRET is set in your .env file

4. **CORS issues**
   - Ensure your frontend URL is in the CORS configuration

## Production Deployment

When deploying to production:

1. **Update Google OAuth settings**
   - Add your production domain to authorized origins
   - Add production callback URL to authorized redirect URIs

2. **Update environment variables**
   - Set production values for GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Use a secure SESSION_SECRET

3. **HTTPS requirement**
   - Google OAuth requires HTTPS in production
   - Update session cookie settings for secure: true

## Next Steps

- Consider adding profile picture display from Google
- Implement account linking for users with both local and Google accounts
- Add option to disconnect Google account
- Implement refresh token handling for long-term sessions