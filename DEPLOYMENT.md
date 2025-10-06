# Deployment Guide

This guide will help you deploy the Event Booking Platform to production.

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. Update your backend `package.json` scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

2. Create a `render.yaml` file in the backend directory:
```yaml
services:
  - type: web
    name: event-booking-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

### Step 2: Deploy to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Select the backend folder as the root directory
5. Configure the following settings:
   - **Name**: `event-booking-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or upgrade as needed)

6. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

7. Click "Create Web Service"

### Step 3: Get Backend URL

After deployment, Render will provide you with a URL like:
`https://event-booking-backend.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. Create a `vercel.json` file in the frontend directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

6. Click "Deploy"

### Step 3: Update Backend CORS

After getting your frontend URL, update the backend environment variable:
```
CLIENT_URL=https://your-frontend-url.vercel.app
```

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster

### Step 2: Configure Database

1. **Network Access**: Add your IP address or `0.0.0.0/0` for all IPs
2. **Database Access**: Create a database user
3. **Get Connection String**: Copy the connection string

### Step 3: Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

## 🔧 Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event-booking
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-frontend-url.vercel.app
PORT=5000
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## 🧪 Testing Deployment

### Step 1: Test Backend

1. Visit your backend health endpoint:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

### Step 2: Test Frontend

1. Visit your frontend URL
2. Try to register a new account
3. Create an event (as organizer)
4. Book a ticket (as user)

### Step 3: Test API Integration

1. Open browser developer tools
2. Check network requests to ensure they're hitting your backend
3. Verify authentication is working

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CLIENT_URL` in backend matches your frontend URL exactly
2. **Database Connection**: Verify MongoDB Atlas connection string and network access
3. **Build Failures**: Check that all dependencies are in `package.json`
4. **Environment Variables**: Ensure all required env vars are set in deployment platform

### Debug Steps

1. Check deployment logs in Render/Vercel dashboard
2. Verify environment variables are set correctly
3. Test API endpoints using Postman or curl
4. Check browser console for frontend errors

## 📈 Scaling Considerations

### Backend Scaling
- Upgrade Render instance type for higher traffic
- Consider Redis for session storage
- Implement rate limiting
- Add monitoring and logging

### Frontend Scaling
- Use CDN for static assets
- Implement caching strategies
- Add performance monitoring
- Consider server-side rendering (Next.js)

### Database Scaling
- Monitor MongoDB Atlas metrics
- Consider read replicas for high traffic
- Implement proper indexing
- Regular database backups

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit sensitive data to git
2. **HTTPS**: Always use HTTPS in production
3. **JWT Secrets**: Use strong, random JWT secrets
4. **Database Security**: Use MongoDB Atlas security features
5. **CORS**: Restrict CORS to your frontend domain only
6. **Rate Limiting**: Implement rate limiting on API endpoints

## 📞 Support

If you encounter issues during deployment:

1. Check the deployment logs
2. Verify all environment variables
3. Test locally first
4. Check platform-specific documentation
5. Contact support for the deployment platform
