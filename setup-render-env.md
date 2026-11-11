# Render Environment Variables Setup Guide

## 🔧 Fix for MongoDB Connection Error

The error you're seeing is because the `MONGODB_URI` environment variable is not set in your Render deployment.

## 📋 Steps to Fix:

### 1. Go to Your Render Dashboard

- Visit [dashboard.render.com](https://dashboard.render.com)
- Find your `milkrecord-backend` service

### 2. Set Environment Variables

- Click on your backend service
- Go to "Environment" tab
- Add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secure_jwt_secret_here
```

### 3. Get MongoDB Connection String

If you don't have a MongoDB database yet:

#### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with your database name (e.g., `milkrecord`)

Example connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/milkrecord?retryWrites=true&w=majority
```

#### Option B: Render MongoDB

1. In Render dashboard, create new MongoDB service
2. Use the provided connection string

### 4. Set JWT Secret

Generate a secure random string for JWT_SECRET:

- Use a password generator
- Or use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 5. Redeploy

- After setting environment variables, Render will automatically redeploy
- Or manually trigger a redeploy

### 6. Test

- Check logs for successful MongoDB connection
- Test health endpoint: `https://your-backend.onrender.com/api/health`

## 🚨 Important Notes:

- Never commit environment variables to Git
- Use strong, unique JWT secrets
- Keep MongoDB connection strings secure
- Test locally with .env file first

## 🔍 Troubleshooting:

- Check Render logs for detailed error messages
- Verify environment variable names match exactly
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Test connection string locally first
