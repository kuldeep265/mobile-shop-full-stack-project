# Troubleshooting Guide

## Backend Not Starting - MongoDB Connection Issue

### Problem
Backend server fails to start or doesn't respond. This is usually because MongoDB is not running.

### Solution 1: Start Local MongoDB

**Windows:**
```powershell
# Check if MongoDB service exists
Get-Service -Name MongoDB* -ErrorAction SilentlyContinue

# Start MongoDB service
net start MongoDB

# OR if service name is different
net start "MongoDB Server"
```

**Alternative - Start MongoDB manually:**
```powershell
# Navigate to MongoDB bin directory (usually)
cd "C:\Program Files\MongoDB\Server\7.0\bin"
.\mongod.exe
```

### Solution 2: Use MongoDB Atlas (Cloud - Recommended)

1. **Sign up for MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a free cluster (M0 Sandbox)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `fone-factory`

3. **Update .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fone-factory?retryWrites=true&w=majority
   ```

4. **Whitelist IP Address:**
   - In Atlas, go to Network Access
   - Add your IP address (or 0.0.0.0/0 for all IPs - development only)

### Solution 3: Install MongoDB Locally

If MongoDB is not installed:

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Download and install for Windows

2. **Install as Service:**
   - During installation, choose "Install MongoDB as a Service"
   - This will start MongoDB automatically

3. **Verify Installation:**
   ```powershell
   mongosh --version
   ```

### Verify MongoDB is Running

```powershell
# Test connection
Test-NetConnection -ComputerName localhost -Port 27017

# OR try connecting with mongosh
mongosh mongodb://localhost:27017
```

### After Fixing MongoDB

1. **Restart Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Check for Success:**
   - You should see: `MongoDB Connected`
   - Server should show: `Server running on port 5000`

3. **Test Backend:**
   - Open browser: http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"Server is running"}`

---

## Frontend Not Starting

### Problem
Frontend server fails to start or shows errors.

### Solutions

1. **Clear cache and reinstall:**
   ```powershell
   cd frontend
   rm -r node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

2. **Check for port conflicts:**
   - If port 3000 is in use, Vite will automatically use the next available port
   - Check the terminal output for the actual port

3. **Check Node version:**
   ```powershell
   node --version
   # Should be v14 or higher
   ```

---

## Common Errors

### "Cannot find module"
```powershell
# Solution: Reinstall dependencies
cd backend  # or frontend
npm install
```

### "Port already in use"
```powershell
# Find process using port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### "EADDRINUSE"
- Another application is using the port
- Change PORT in .env file or stop the conflicting application

---

## Quick Health Check

Run these commands to check everything:

```powershell
# Check MongoDB
Test-NetConnection -ComputerName localhost -Port 27017

# Check Backend
Invoke-WebRequest -Uri "http://localhost:5000/api/health"

# Check Frontend
Invoke-WebRequest -Uri "http://localhost:3000"
```

---

## Still Having Issues?

1. Check terminal output for specific error messages
2. Verify all environment variables in `.env` file
3. Make sure Node.js version is 14 or higher
4. Try restarting your computer (sometimes helps with service issues)

