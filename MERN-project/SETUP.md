# Setup Guide - Fone Factory

## Quick Start Guide

Follow these steps to get your MERN e-commerce project up and running.

---

## Prerequisites

Before you start, make sure you have installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - **Local MongoDB**: [Download](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud - Recommended): [Sign up](https://www.mongodb.com/cloud/atlas)

3. **Git** (optional) - [Download](https://git-scm.com/)

---

## Step 1: Install Backend Dependencies

Open a terminal/command prompt and navigate to the backend folder:

```bash
cd backend
npm install
```

This will install all required packages (Express, Mongoose, JWT, etc.)

---

## Step 2: Configure Backend Environment

1. Create a `.env` file in the `backend` folder
2. Copy the content below and fill in your values:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/fone-factory
# OR for MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fone-factory

# JWT Secret (use a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary (for image uploads) - Optional for now
# Sign up at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateways (Optional - can add later)
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (Optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Minimum Required Variables:**
- `MONGODB_URI` (required)
- `JWT_SECRET` (required - use any random string)
- `PORT` (optional - defaults to 5000)
- `FRONTEND_URL` (optional - defaults to http://localhost:3000)

**Note:** You can start with just MongoDB and JWT_SECRET. Other services can be added later.

---

## Step 3: Start MongoDB

### Option A: Local MongoDB
If you installed MongoDB locally:

**Windows:**
```bash
# MongoDB usually starts automatically as a service
# Or start it manually:
net start MongoDB
```

**Mac/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster (free tier available)
4. Get your connection string
5. Replace `MONGODB_URI` in `.env` with your Atlas connection string

---

## Step 4: Start Backend Server

In the `backend` folder, run:

```bash
npm run dev
```

You should see:
```
MongoDB Connected
Server running on port 5000
```

**Keep this terminal open!**

---

## Step 5: Install Frontend Dependencies

Open a **NEW** terminal/command prompt and navigate to the frontend folder:

```bash
cd frontend
npm install
```

This will install React, Vite, Tailwind CSS, and all frontend dependencies.

---

## Step 6: Configure Frontend (Optional)

Create a `.env` file in the `frontend` folder (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Note:** If you don't create this file, the frontend will use default values.

---

## Step 7: Start Frontend Server

In the `frontend` folder, run:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

---

## Step 8: Open Your Browser

Open your browser and go to:
```
http://localhost:3000
```

You should see the Fone Factory homepage! 🎉

---

## Step 9: Create an Admin User (Optional)

To access the admin dashboard:

1. Register a new user through the website
2. Open MongoDB Compass or use MongoDB shell
3. Find your user and update the role:

**Using MongoDB Shell:**
```bash
mongosh
use fone-factory
db.users.updateOne({email: "your-email@example.com"}, {$set: {role: "admin"}})
```

**Using MongoDB Compass:**
- Connect to your database
- Navigate to `fone-factory` → `users` collection
- Find your user document
- Change `role` from `"customer"` to `"admin"`

---

## Troubleshooting

### Backend Issues

**Error: "MongoDB connection error"**
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For Atlas: Check your IP whitelist and connection string

**Error: "Port 5000 already in use"**
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

**Error: "Cannot find module"**
- Run `npm install` again in the backend folder
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Frontend Issues

**Error: "Cannot connect to API"**
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

**Error: "Port 3000 already in use"**
- Vite will automatically use the next available port
- Or change the port in `vite.config.js`

**Styles not loading (Tailwind CSS)**
- Make sure you ran `npm install` in frontend
- Check that `tailwind.config.js` exists
- Restart the dev server

### General Issues

**"npm: command not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)

**Dependencies installation fails**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Project Structure

```
MERN-project/
├── backend/          # Node.js/Express API
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   ├── middleware/  # Auth middleware
│   └── server.js    # Entry point
│
└── frontend/        # React application
    ├── src/
    │   ├── pages/   # React pages
    │   ├── components/ # Reusable components
    │   └── context/ # React context
    └── package.json
```

---

## Next Steps

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Register a user account
4. ✅ Create admin user (optional)
5. ✅ Add products through admin dashboard
6. ✅ Start shopping!

---

## Development Tips

- **Backend logs**: Check the terminal where `npm run dev` is running
- **Frontend logs**: Check browser console (F12)
- **API testing**: Use Postman or browser to test endpoints
- **Database**: Use MongoDB Compass to view your data

---

## Need Help?

- Check the `README.md` for more details
- Review error messages in terminal/console
- Make sure all environment variables are set correctly
- Verify MongoDB connection

Happy coding! 🚀

