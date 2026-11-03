# Quick Start - Run Your Project

## ⚠️ Important: Create Backend .env File First!

Before running, you need to create a `.env` file in the `backend` folder with these minimum required variables:

1. Create `backend/.env` file
2. Add this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fone-factory
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fone-factory
```

---

## 🚀 Running the Project

### Option 1: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using the Scripts Below

---

## 📋 Step-by-Step

### 1. Make sure MongoDB is running

**Local MongoDB:**
- Windows: MongoDB should start automatically
- Or run: `net start MongoDB`

**MongoDB Atlas:**
- No local setup needed, just use your connection string

### 2. Start Backend (Terminal 1)

```powershell
cd backend
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5000
```

### 3. Start Frontend (Terminal 2 - New Terminal)

```powershell
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

### 4. Open Browser

Go to: **http://localhost:3000**

---

## ✅ Verify Everything is Working

1. ✅ Backend: http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"Server is running"}`

2. ✅ Frontend: http://localhost:3000
   - Should show the Fone Factory homepage

---

## 🐛 Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists in `backend` folder
- Check if port 5000 is available

**Frontend can't connect to backend:**
- Make sure backend is running
- Check `VITE_API_URL` in `frontend/.env` (or use default)

**MongoDB connection error:**
- For local: Start MongoDB service
- For Atlas: Check connection string and IP whitelist

---

## 🎯 Next Steps After Running

1. Register a new user account
2. (Optional) Create admin user in MongoDB
3. Start adding products through admin dashboard
4. Start shopping!

---

Both servers are now running in the background! Check the terminal windows for any errors.

