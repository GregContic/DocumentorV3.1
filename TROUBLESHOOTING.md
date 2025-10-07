# Vercel Deployment Troubleshooting Guide

Common issues and their solutions when deploying DocumentorV3 to Vercel.

## 🔴 Build Errors

### Error: "Cannot find module 'X'"

**Symptom:** Build fails with module not found error

**Solutions:**
```bash
# 1. Check if dependency is in package.json dependencies (not devDependencies)
npm install <package-name> --save

# 2. Ensure all workspaces have dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
```

**Vercel-specific:**
- Go to Settings → General → "Clear Build Cache"
- Redeploy

### Error: "Build exceeded maximum duration"

**Symptom:** Build times out after 45 minutes

**Solutions:**
1. Check `.vercelignore` excludes unnecessary files
2. Remove heavy dependencies if not needed
3. Optimize build scripts

```javascript
// Optimize frontend build in package.json
"build": "GENERATE_SOURCEMAP=false react-scripts build"
```

### Error: "Out of memory during build"

**Solutions:**
1. Increase Node memory limit:
```json
// package.json
"scripts": {
  "build": "NODE_OPTIONS=--max_old_space_size=4096 react-scripts build"
}
```

2. Upgrade to Vercel Pro for more build resources

## 🔴 Database Connection Errors

### Error: "MongoNetworkError: connection refused"

**Symptom:** Cannot connect to MongoDB

**Solutions:**

1. **Check MongoDB Atlas Network Access**
   - Go to Atlas → Network Access
   - Add entry: `0.0.0.0/0` (allow from anywhere)
   - Vercel functions use dynamic IPs

2. **Verify Connection String**
   ```
   ✅ Correct: mongodb+srv://user:pass@cluster.mongodb.net/dbname
   ❌ Wrong:  mongodb://localhost:27017/dbname
   ```

3. **Check Environment Variable**
   - Vercel Dashboard → Settings → Environment Variables
   - Verify `MONGODB_URI` is set for Production
   - Redeploy after adding/changing variables

4. **Test Connection String**
   ```bash
   # In terminal
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
   ```

### Error: "MongoTimeoutError: Server selection timed out"

**Solutions:**
1. Database cluster is sleeping (free tier)
   - Wait 30 seconds for cluster to wake up
   - Upgrade to M2+ for always-on

2. Wrong database name in connection string
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME
                                                    ^^^^^^^^^^
   ```

### Error: "Authentication failed"

**Solutions:**
1. Wrong password in connection string
2. Password has special characters (needs URL encoding)
   ```javascript
   // Encode password
   const encodedPassword = encodeURIComponent("p@ssw0rd!");
   ```

3. Database user not created in Atlas
   - Atlas → Database Access → Add Database User

## 🔴 CORS Errors

### Error: "Access-Control-Allow-Origin header is missing"

**Symptom:** API calls fail with CORS error in browser console

**Solutions:**

1. **Update CORS in backend/server.js**
   ```javascript
   const corsOptions = {
     origin: [
       process.env.FRONTEND_URL,
       'https://your-actual-vercel-url.vercel.app'
     ],
     credentials: true
   };
   ```

2. **Set Environment Variables**
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Check Domain Match**
   - Frontend URL must EXACTLY match CORS origin
   - Include/exclude `www` consistently
   - Check https vs http

4. **Redeploy after CORS changes**
   ```bash
   git add backend/server.js
   git commit -m "Fix CORS"
   git push
   ```

### Error: "CORS preflight OPTIONS request failed"

**Solutions:**
```javascript
// Ensure OPTIONS is handled
app.options('*', cors(corsOptions));
```

## 🔴 API Route 404 Errors

### Error: "GET /api/... 404 Not Found"

**Symptom:** Frontend can't reach backend API

**Solutions:**

1. **Check vercel.json routes**
   ```json
   {
     "routes": [
       { "src": "/api/(.*)", "dest": "api/index.js" }
     ]
   }
   ```

2. **Verify api/index.js exists**
   ```javascript
   // api/index.js
   const app = require('../backend/server');
   module.exports = app;
   ```

3. **Check Express routes**
   ```javascript
   // Routes should be /api/auth/login not /auth/login
   app.use('/api/auth', authRoutes);
   ```

4. **Check frontend API calls**
   ```javascript
   // Should call /api/auth/login
   axios.post('/api/auth/login', credentials);
   ```

## 🔴 Environment Variable Issues

### Error: "process.env.X is undefined"

**Solutions:**

1. **Add variable in Vercel Dashboard**
   - Settings → Environment Variables
   - Select "Production" environment
   - Click "Save"

2. **Redeploy after adding variables**
   - Deployments → Redeploy (dot menu)
   - Or push new commit

3. **Frontend variables need REACT_APP_ prefix**
   ```
   ✅ REACT_APP_API_URL
   ❌ API_URL
   ```

4. **Check variable spelling**
   - Case-sensitive
   - No typos

### Error: "Cannot read property of undefined"

**Symptom:** Code breaks when accessing env variable

**Solutions:**
```javascript
// Use fallback values
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Or check before using
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

## 🔴 File Upload Issues

### Error: "ENOENT: no such file or directory"

**Symptom:** File uploads fail or downloaded files not found

**Cause:** Vercel has ephemeral file system

**Solutions:**

1. **Short-term: Use /tmp directory**
   ```javascript
   const tmpDir = '/tmp/uploads';
   if (!fs.existsSync(tmpDir)) {
     fs.mkdirSync(tmpDir, { recursive: true });
   }
   ```

2. **Long-term: Use cloud storage**

   **AWS S3 Example:**
   ```javascript
   const AWS = require('aws-sdk');
   const s3 = new AWS.S3({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   });

   const uploadToS3 = async (file) => {
     const params = {
       Bucket: process.env.AWS_S3_BUCKET,
       Key: file.originalname,
       Body: file.buffer
     };
     return s3.upload(params).promise();
   };
   ```

   **Cloudinary Example:**
   ```javascript
   const cloudinary = require('cloudinary').v2;

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   ```

## 🔴 Authentication Issues

### Error: "Token invalid or expired"

**Solutions:**

1. **Check JWT_SECRET consistency**
   - Same secret in all environments
   - Not changed between deployments

2. **Check token expiration**
   ```javascript
   // Extend token expiration
   jwt.sign(payload, secret, { expiresIn: '7d' })
   ```

3. **Clear localStorage and re-login**
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```

### Error: "Unauthorized 401"

**Solutions:**

1. **Check Authorization header**
   ```javascript
   // Ensure interceptor adds token
   config.headers.Authorization = `Bearer ${token}`;
   ```

2. **Verify authMiddleware**
   ```javascript
   // Check token verification in middleware
   const token = req.header('Authorization')?.replace('Bearer ', '');
   ```

## 🔴 Build Output Issues

### Error: "Page not found" on refresh

**Symptom:** SPA routes work on navigation but not on direct access/refresh

**Solutions:**

1. **Check vercel.json rewrites**
   ```json
   {
     "routes": [
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

2. **Ensure frontend build includes all routes**
   - React Router should use BrowserRouter
   - Not HashRouter

## 🔴 Performance Issues

### Error: "Function execution timed out"

**Symptom:** 504 Gateway Timeout after 10 seconds

**Solutions:**

1. **Optimize database queries**
   ```javascript
   // Add indexes
   userSchema.index({ email: 1 });
   
   // Use lean() for read-only
   User.find().lean();
   
   // Limit returned fields
   User.find().select('name email');
   ```

2. **Increase timeout (Pro plan)**
   ```json
   // vercel.json
   {
     "functions": {
       "api/index.js": {
         "maxDuration": 60
       }
     }
   }
   ```

3. **Use background jobs for long tasks**

### Error: "Memory limit exceeded"

**Solutions:**

1. **Increase memory in vercel.json**
   ```json
   {
     "functions": {
       "api/index.js": {
         "memory": 3008
       }
     }
   }
   ```

2. **Optimize code**
   - Stream large files instead of loading into memory
   - Process in chunks

## 🔴 Deployment Issues

### Error: "Deployment failed without error message"

**Solutions:**

1. **Check deployment logs**
   - Vercel Dashboard → Deployments → Click deployment
   - View "Build Logs" tab

2. **Test build locally**
   ```bash
   npm run vercel-build
   ```

3. **Clear Vercel cache**
   - Settings → General → Clear Build Cache

### Error: "Git push doesn't trigger deployment"

**Solutions:**

1. **Check GitHub integration**
   - Vercel Dashboard → Settings → Git
   - Reconnect if needed

2. **Check branch settings**
   - Ensure you're pushing to correct branch
   - Production Branch in Vercel matches your branch

3. **Manual deployment**
   - Vercel Dashboard → Deployments → "Redeploy"

## 🔴 Email Issues

### Error: "Failed to send email"

**Solutions:**

1. **Gmail: Use App Password**
   - Not regular password
   - Enable 2FA first
   - Generate app-specific password

2. **Check credentials**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

3. **Enable less secure apps (if needed)**
   - Gmail → Security → Less secure app access

## 🔴 Debugging Tools

### Check Deployment Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs YOUR_URL
```

### Test API Endpoints
```bash
# Test with curl
curl https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Check Environment Variables
```javascript
// Add temporary endpoint to check (remove after testing)
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
});
```

### MongoDB Atlas Logs
- Atlas Dashboard → Clusters → Logs
- Check connection attempts and errors

## 🆘 Still Having Issues?

1. **Check Vercel Status**
   - [status.vercel.com](https://status.vercel.com)

2. **Review all documentation**
   - DEPLOYMENT.md
   - QUICK_DEPLOY.md
   - PRE_DEPLOYMENT_CHECKLIST.md

3. **Vercel Support**
   - Community: [vercel.com/support](https://vercel.com/support)
   - Documentation: [vercel.com/docs](https://vercel.com/docs)

4. **Test locally first**
   ```bash
   # Ensure everything works locally
   npm run dev:backend
   npm run dev:frontend
   ```

5. **Compare with working deployment**
   - Check Vercel examples: [github.com/vercel/vercel](https://github.com/vercel/vercel)

## 📋 Debugging Checklist

When something doesn't work:

- [ ] Check Vercel deployment logs
- [ ] Check browser console for errors
- [ ] Check MongoDB Atlas logs
- [ ] Verify all environment variables are set
- [ ] Test API endpoint directly (Postman/curl)
- [ ] Check CORS configuration
- [ ] Verify database connection string
- [ ] Ensure code works locally
- [ ] Check file paths (case-sensitive on Vercel)
- [ ] Redeploy after changes
- [ ] Clear browser cache
- [ ] Test in incognito mode

Remember: 90% of issues are environment variables, CORS, or database connection! 🎯
