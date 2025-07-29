# 🚀 Render Deployment Guide

This guide will help you deploy your Milk Record application on Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
3. **GitHub Repository**: Your code should be on GitHub

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

### Option 2: Render MongoDB

1. In Render dashboard, create a new MongoDB service
2. Use the provided connection string

## 🔧 Environment Variables

You'll need to set these environment variables in Render:

### Backend Environment Variables

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend Environment Variables

```
REACT_APP_API_URL=https://your-backend-service-name.onrender.com
```

## 📦 Deployment Steps

### Step 1: Deploy Backend

1. **Go to Render Dashboard**

   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**

   - Connect your GitHub account
   - Select the `milkrecord` repository
   - Choose the `main` branch

3. **Configure Backend Service**

   ```
   Name: milkrecord-backend
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```

4. **Set Environment Variables**

   - Add all backend environment variables listed above
   - Make sure to use your actual MongoDB connection string

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://milkrecord-backend.onrender.com`)

### Step 2: Deploy Frontend

1. **Create New Web Service**

   - Click "New +" → "Web Service"
   - Connect to the same repository

2. **Configure Frontend Service**

   ```
   Name: milkrecord-frontend
   Environment: Static Site
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/build
   ```

3. **Set Environment Variables**

   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com
   ```

4. **Configure Routes**

   - Add a rewrite rule:
     - Source: `/*`
     - Destination: `/index.html`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

## 🔍 Health Check

The backend includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "OK",
  "message": "Milk Record API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🌐 Custom Domains

### Adding Custom Domain

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

### SSL Certificate

- Render automatically provides SSL certificates
- No additional configuration needed

## 📊 Monitoring

### Logs

- View logs in the Render dashboard
- Real-time log streaming available
- Log retention for debugging

### Metrics

- Response times
- Error rates
- Resource usage

## 🔄 Auto-Deploy

### Automatic Deployments

- Render automatically deploys on every push to the main branch
- Manual deployments available
- Rollback to previous versions

### Branch Deployments

- Deploy from different branches
- Preview deployments for testing

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**

   - Check build logs
   - Verify all dependencies are in package.json
   - Ensure build commands are correct

2. **Database Connection Issues**

   - Verify MongoDB connection string
   - Check IP whitelist settings
   - Ensure database is accessible

3. **Environment Variables**

   - Double-check variable names
   - Ensure values are correct
   - No spaces around `=` in values

4. **CORS Issues**
   - Backend CORS is configured for all origins
   - Check if frontend URL is correct

### Debug Commands

```bash
# Check backend logs
curl https://your-backend.onrender.com/api/health

# Test database connection
# Check MongoDB Atlas dashboard

# Verify environment variables
# Check Render dashboard → Environment
```

## 📈 Performance Optimization

### Backend

- Enable caching where appropriate
- Optimize database queries
- Use connection pooling

### Frontend

- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets

## 🔒 Security

### Environment Variables

- Never commit sensitive data
- Use Render's secure environment variables
- Rotate JWT secrets regularly

### Database Security

- Use strong passwords
- Enable MongoDB authentication
- Restrict IP access when possible

## 📞 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **MongoDB Atlas Support**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## 🎯 Next Steps

After deployment:

1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domain (optional)
4. Set up CI/CD pipeline
5. Monitor performance and optimize

---

**Happy Deploying! 🚀**
