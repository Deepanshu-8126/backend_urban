# Render.com Deployment Guide for Urban OS Backend

## 📋 Pre-Deployment Checklist

### 1. **Prepare Your Code**
- ✅ Ensure `package.json` has correct start script: `"start": "node src/index.js"`
- ✅ PORT is read from environment: `process.env.PORT || 3000`
- ✅ Database URI uses environment variable: `process.env.MONGODB_URI`

### 2. **Environment Variables Needed**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbandb
JWT_SECRET=your-secret-key-here
PORT=10000
NODE_ENV=production
GROQ_API_KEY=your-groq-key
GOOGLE_API_KEY=your-google-key
SENDGRID_API_KEY=your-sendgrid-key
ALLOWED_ORIGINS=https://your-flutter-web-app.com,http://localhost
```

---

## 🚀 Step-by-Step Deployment

### **Method 1: Deploy from GitHub (Recommended)**

#### Step 1: Push Code to GitHub
```bash
cd urban_backend
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

#### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**

#### Step 3: Connect Repository
1. Select your GitHub repository
2. Choose `urban-project` (or your repo name)
3. Set **Root Directory**: `urban_backend`

#### Step 4: Configure Build Settings
- **Name**: `urban-os-backend`
- **Region**: Oregon (Free tier)
- **Branch**: `main`
- **Root Directory**: `urban_backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Step 5: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add each variable:
```
MONGODB_URI → your-mongodb-connection-string
JWT_SECRET → generate-a-secure-random-string
GROQ_API_KEY → your-groq-api-key
GOOGLE_API_KEY → your-google-api-key
PORT → 10000
NODE_ENV → production
ALLOWED_ORIGINS → https://your-flutter-app.com
```

#### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend will be live at: `https://urban-os-backend.onrender.com`

---

### **Method 2: Deploy with Render Blueprint (Faster)**

1. Place the `render.yaml` file in your `urban_backend` directory
2. Go to Render Dashboard → **"Blueprints"**
3. Click **"New Blueprint Instance"**
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and configure everything
6. Just add your secret environment variables manually

---

## 🔧 Post-Deployment Configuration

### Update Flutter App API URL
In your Flutter app, update API base URL:

```dart
// lib/core/api_service.dart
static const String baseUrl = 'https://urban-os-backend.onrender.com/api/v1';
```

### Update CORS Settings
In `src/index.js`, add Render URL to CORS:
```javascript
const allowedOrigins = [
  'https://your-flutter-app.com',
  'http://localhost:52000',
  // Add any other origins
];
```

---

## 📊 Monitor Your Backend

### Render Dashboard Features:
- **Logs**: Real-time server logs
- **Metrics**: CPU, Memory, Request count
- **Deploy History**: Rollback to previous versions
- **Auto-Deploy**: Automatic deployment on git push

### Check Deployment Health:
```bash
curl https://urban-os-backend.onrender.com/
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server Health Check - Working!",
  "timestamp": "2026-02-04T..."
}
```

---

## ⚡ Important Notes

### Free Tier Limitations:
- ⚠️ **Cold Starts**: Server sleeps after 15 min of inactivity (takes 30-60s to wake up)
- 🕒 **750 hours/month**: Free tier limit
- 💾 **Disk**: Temporary storage (files uploaded will be lost on restart)

### Persistent File Storage Solution:
For image uploads, use:
- **Cloudinary** (free tier: 25GB)
- **AWS S3** (pay-as-you-go)
- **Render Disks** (paid add-on)

### Database:
- Use **MongoDB Atlas** (free tier: 512MB)
- Connection string format: `mongodb+srv://...`

---

## 🐛 Troubleshooting

### Build Fails:
- Check `package.json` for missing dependencies
- Ensure Node version compatibility
- Check build logs in Render dashboard

### Server Crashes:
- Check environment variables are set correctly
- Review server logs in Render
- Ensure MongoDB connection string is correct

### CORS Errors:
- Add your frontend URL to `ALLOWED_ORIGINS`
- Update CORS configuration in `index.js`

---

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Trigger a new build
2. Run `npm install`
3. Start server with `npm start`
4. Deploy new version (zero downtime)

---

## 📱 Connect Flutter App

After deployment, update your Flutter app:

```dart
// Before (Local)
static const String baseUrl = 'http://localhost:3000/api/v1';

// After (Production)
static const String baseUrl = 'https://urban-os-backend.onrender.com/api/v1';
```

---

## ✅ Quick Start Commands

```bash
# 1. Navigate to backend
cd urban_backend

# 2. Create render.yaml (already done above)

# 3. Commit changes
git add .
git commit -m "Add Render deployment config"
git push origin main

# 4. Go to render.com and create web service
# 5. Connect GitHub repo
# 6. Add environment variables
# 7. Deploy!
```

Your backend will be live in ~10 minutes! 🎉
