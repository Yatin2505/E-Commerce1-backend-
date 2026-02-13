# E-Commerce Backend

A production-ready backend for MERN stack eCommerce website.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Password Hashing:** bcryptjs

## Project Structure

```
backend/
├── config/
│   └── database.js         # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product CRUD operations
│   ├── cartController.js   # Cart operations
│   └── orderController.js  # Order operations
├── middleware/
│   ├── authMiddleware.js    # JWT authentication & authorization
│   └── errorMiddleware.js   # Centralized error handling
├── models/
│   ├── User.js              # User model
│   ├── Product.js           # Product model
│   ├── Cart.js              # Cart model
│   └── Order.js             # Order model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── productRoutes.js     # Product routes
│   ├── cartRoutes.js        # Cart routes
│   └── orderRoutes.js       # Order routes
├── .env                     # Environment variables
├── package.json             # Dependencies
└── server.js                # Entry point
```

## Features

### Authentication System
- User registration and login
- JWT token generation
- Password hashing with bcrypt
- Role-based access (Admin, User)
- Protected routes middleware

### Product APIs
- Create product (Admin only)
- Update product (Admin only)
- Delete product (Admin only)
- Get all products (with pagination & search)
- Get single product
- Add product reviews

### Cart APIs
- Add to cart
- Remove from cart
- Update quantity
- Get user cart
- Clear cart

### Order APIs
- Create order
- Get user orders
- Get single order
- Admin: Get all orders
- Update order status
- Cancel order

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Steps

1. **Install Dependencies**
   
```
bash
   cd backend
   npm install
   
```

2. **Configure Environment Variables**
   
   Create a `.env` file in the backend folder with the following:
   
```
env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   
```

3. **Start MongoDB**
   
   Make sure MongoDB is running locally or use MongoDB Atlas.

4. **Run the Server**
   
   Development mode:
   
```
bash
   npm run dev
   
```
   
   Production mode:
   
```
bash
   npm start
   
```

5. **Verify Server is Running**
   
   Visit: `http://localhost:5000/api/health`

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Private |
| PUT | /api/auth/profile | Update profile | Private |
| PUT | /api/auth/password | Update password | Private |
| GET | /api/auth/users | Get all users | Admin |
| DELETE | /api/auth/users/:id | Delete user | Admin |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/products | Get all products | Public |
| GET | /api/products/top | Get top products | Public |
| GET | /api/products/:id | Get single product | Public |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| POST | /api/products/:id/reviews | Add review | Private |

### Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/cart | Get user cart | Private |
| POST | /api/cart | Add to cart | Private |
| PUT | /api/cart/:productId | Update quantity | Private |
| DELETE | /api/cart/:productId | Remove from cart | Private |
| DELETE | /api/cart | Clear cart | Private |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/orders/myorders | Get user orders | Private |
| GET | /api/orders/:id | Get single order | Private |
| POST | /api/orders | Create order | Private |
| PUT | /api/orders/:id/cancel | Cancel order | Private |
| PUT | /api/orders/:id/payment | Update payment | Private |
| GET | /api/orders/admin/all | Get all orders | Admin |
| PUT | /api/orders/:id/status | Update status | Admin |

## Testing with Postman

1. **Register a User**
   - POST `/api/auth/register`
   - Body: `{ "name": "John", "email": "john@example.com", "password": "password123" }`

2. **Login**
   - POST `/api/auth/login`
   - Body: `{ "email": "john@example.com", "password": "password123" }`
   - Copy the `token` from response

3. **Access Protected Routes**
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`

4. **Create Admin User**
   - Manually change user role in MongoDB to "admin" or create first admin through direct database entry.

## Error Responses

All errors return a JSON response in the following format:

```
json
{
  "success": false,
  "message": "Error message here"
}
```

## Development Notes

- All passwords are hashed using bcryptjs
- JWT tokens expire in 30 days (configurable in .env)
- Product search is case-insensitive
- Cart automatically calculates total price
- Order creation clears the cart and reduces product stock
