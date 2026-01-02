# How to Run Your Project - Step by Step

## ⚠️ Important: Run commands from the correct directory!

## Method 1: Using Two Terminal Windows (Recommended)

### Terminal 1 - Backend Server

1. Open PowerShell or Command Prompt
2. Navigate to backend folder:
   ```powershell
   cd C:\Users\kulde\OneDrive\Desktop\MERN-project\backend
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```
4. You should see:
   ```
   MongoDB Connected
   Server running on port 5000
   ```
5. **Keep this terminal open!**

---

### Terminal 2 - Frontend Server

1. Open a **NEW** PowerShell or Command Prompt window
2. Navigate to frontend folder:
   ```powershell
   cd C:\Users\kulde\OneDrive\Desktop\MERN-project\frontend
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```
4. You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```
5. **Keep this terminal open!**

---

## Method 2: Using the Batch File

1. Double-click `START_SERVERS.bat` in the project root
2. Two terminal windows will open automatically
3. Wait for both servers to start
4. Open browser: http://localhost:5173 (or the port shown in terminal)

---

## Common Errors and Solutions

### Error: "ENOENT: could not read package.json"

**Problem:** You're in the wrong directory

**Solution:**
```powershell
# Check where you are
pwd  # or Get-Location in PowerShell

# Navigate to the correct folder
cd C:\Users\kulde\OneDrive\Desktop\MERN-project\frontend

# Then run
npm run dev
```

### Error: "vite is not recognized"

**Problem:** Dependencies not installed

**Solution:**
```powershell
cd C:\Users\kulde\OneDrive\Desktop\MERN-project\frontend
npm install
npm run dev
```

### Error: "Port already in use"

**Problem:** Another process is using the port

**Solution:**
- Vite will automatically use the next available port (5174, 5175, etc.)
- Check the terminal for the actual port number
- Or change the port in `vite.config.js`

---

## Verify Everything is Working

1. **Backend:** Open http://localhost:5000/api/health
   - Should show: `{"status":"OK","message":"Server is running"}`

2. **Frontend:** Open http://localhost:5173 (or the port shown in terminal)
   - Should show the Fone Factory homepage

---

## Quick Reference

| Server | Directory | Command | URL |
|--------|-----------|---------|-----|
| Backend | `backend/` | `npm run dev` | http://localhost:5000 |
| Frontend | `frontend/` | `npm run dev` | http://localhost:5173 |

---

## Still Having Issues?

1. Make sure you're in the correct directory before running commands
2. Check that `package.json` exists in that directory
3. Make sure dependencies are installed (`npm install`)
4. Check terminal for error messages
5. Make sure MongoDB is running (for backend)

