# Fone Factory - E-commerce Platform

A full-stack e-commerce website for mobile phones built with MERN stack (MongoDB, Express, React, Node.js).

## Features

### Core Features
- ✅ User Authentication (Sign up, Login, JWT, Forgot password, Roles)
- ✅ Product Catalog with filtering, sorting, and pagination
- ✅ Product Detail Page with images, specs, reviews
- ✅ Shopping Cart functionality
- ✅ Checkout & Orders with payment integration (Stripe, Razorpay)
- ✅ Admin Dashboard (product management, orders, users, sales stats)
- ✅ Wishlist/Favorites
- ✅ Product Reviews & Ratings (CRUD)
- ✅ Discounts/Coupons system
- ✅ Product Comparison (2-4 products)
- ✅ AI-Based Product Recommendations
- ✅ Live Chat/Support (Socket.io)
- ✅ Stock alerts & notifications

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image storage
- Stripe & Razorpay for payments
- Socket.io for live chat
- Nodemailer for emails

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- React Toastify for notifications
- Socket.io Client for chat
- Stripe React for payments

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image storage)
- Stripe/Razorpay account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fone-factory
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
MERN-project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   ├── wishlist.js
│   │   ├── reviews.js
│   │   ├── coupons.js
│   │   ├── compare.js
│   │   ├── recommendations.js
│   │   └── chat.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── routing/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filters, sort, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/brands/list` - Get all brands

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/:id/pay` - Process payment
- `POST /api/orders/create-payment-intent` - Create Stripe payment
- `POST /api/orders/create-razorpay-order` - Create Razorpay order

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Other Features
- Wishlist, Reviews, Coupons, Compare, Recommendations, Chat endpoints

## Usage

1. Start MongoDB (if using local):
```bash
mongod
```

2. Start backend server:
```bash
cd backend
npm run dev
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

4. Open browser and navigate to `http://localhost:3000`

## Creating Admin User

To create an admin user, you can either:
1. Register a user and manually update the role in MongoDB:
```javascript
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

2. Or modify the registration route to allow admin creation during development

## License

MIT

