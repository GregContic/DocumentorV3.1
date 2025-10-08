# Deploying DocumentorV3 to Vercel

This guide will walk you through deploying your full-stack DocumentorV3 application to Vercel with complete functionality (not static).

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: Free cloud MongoDB database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
4. **Environment Variables**: Prepare all your `.env` values

## Project Structure

This deployment configuration supports:
- ✅ Node.js/Express backend as serverless API
- ✅ React frontend (static build served by Vercel CDN)
- ✅ Python OCR functions as serverless endpoints
- ✅ File uploads (temporary storage)
- ✅ MongoDB database connection
- ✅ Authentication and sessions

## Step 1: Prepare MongoDB Atlas

1. Create a free MongoDB Atlas account and cluster
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for Vercel serverless functions
4. Get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

## Step 2: Push to GitHub

## Step 3: Import Project to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

## Step 4: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables

```env
# Node Environment
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/documentor?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Port (Vercel manages this, but include for compatibility)
PORT=5000

# Frontend URL (will be your Vercel domain)
FRONTEND_URL=https://your-app-name.vercel.app

# Email Configuration (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@yourschool.edu

# OpenAI API Key (if using chatbot features)
OPENAI_API_KEY=sk-your-openai-api-key

# React App API URL (important!)
REACT_APP_API_URL=https://your-app-name.vercel.app
```

### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Make sure to set them for **Production**, **Preview**, and **Development** environments

## Step 5: Update CORS Origins

After your first deployment, you'll get a Vercel URL (e.g., `https://your-app.vercel.app`).

**Important**: Update the CORS configuration in `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-actual-app-name.vercel.app']
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ],
  credentials: true
};
```

Replace `'https://your-actual-app-name.vercel.app'` with your actual Vercel domain, commit, and push to trigger redeployment.

## Step 6: Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Once complete, visit your deployed site!

## Step 7: Post-Deployment Setup

### Create Admin User

Since this is a new database, you'll need to create an admin user:

1. **Option A: Use MongoDB Compass or Atlas UI**
   - Connect to your MongoDB Atlas database
   - Navigate to the `users` collection
   - Manually insert an admin user with hashed password

2. **Option B: Temporarily enable registration** (then disable it)
   - Register through the UI
   - Use MongoDB Atlas to change the user's role to 'admin'

3. **Option C: Create a setup endpoint** (recommended)
   - Add a temporary route in your backend to create initial admin
   - Remove it after first use

### Test Your Deployment

1. ✅ Visit homepage: `https://your-app.vercel.app`
2. ✅ Test login/registration
3. ✅ Test enrollment submission
4. ✅ Test document request
5. ✅ Test admin dashboard access
6. ✅ Test file uploads
7. ✅ Test chatbot (if using)

## Important Notes & Limitations

### File Storage

⚠️ **Vercel has ephemeral file storage** - uploaded files are stored temporarily and may be deleted between deployments or after some time.

**Solutions:**
1. **AWS S3** (Recommended): Store files in S3 bucket
2. **Cloudinary**: For images/documents
3. **Vercel Blob Storage**: Vercel's own storage solution
4. **MongoDB GridFS**: Store files directly in MongoDB (for smaller files)

To implement S3 storage, you'll need to:
- Install `aws-sdk` or `@aws-sdk/client-s3`
- Update `uploadMiddleware.js` to upload to S3 instead of local filesystem
- Store S3 URLs in your database instead of file paths

### MongoDB Connection

- Always use MongoDB Atlas (or another cloud provider) - local MongoDB won't work
- Whitelist all IPs (0.0.0.0/0) in Atlas Network Access settings
- Use connection pooling to optimize serverless functions

### Serverless Function Limits

- **Execution time**: 10 seconds (Hobby), 60 seconds (Pro)
- **Memory**: 1024 MB default
- **Payload size**: 4.5 MB for request/response

If you need longer execution times or more memory, upgrade to Vercel Pro.

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'X'`
- **Solution**: Ensure all dependencies are in `package.json` dependencies (not devDependencies)
- Run: `npm install` locally to verify

**Error**: `Build exceeded maximum duration`
- **Solution**: Remove unnecessary files in `.vercelignore`

### API Routes Not Working

**Error**: `404 on /api/...`
- **Solution**: Check `vercel.json` routing configuration
- Ensure `backend/server.js` exports the Express app

**Error**: `CORS errors`
- **Solution**: Update CORS origins in `backend/server.js` with your Vercel domain
- Set `FRONTEND_URL` environment variable correctly

### Database Connection Issues

**Error**: `MongoNetworkError` or `MongoTimeoutError`
- **Solution**: 
  - Verify `MONGODB_URI` is correct
  - Check Atlas Network Access allows all IPs (0.0.0.0/0)
  - Ensure connection string includes database name

### Environment Variables Not Working

- **Solution**: 
  - Redeploy after adding environment variables
  - Check they're set for the correct environment (Production)
  - Prefix frontend variables with `REACT_APP_`

## Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update environment variables with your custom domain

## Monitoring & Logs

- **View Logs**: Vercel Dashboard → Your Project → Deployments → Click deployment → Logs
- **Monitor Usage**: Dashboard → Your Project → Analytics
- **Error Tracking**: Consider integrating Sentry for error monitoring

## Updating Your Application

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Vercel automatically redeploys!
```

## Cost Considerations

**Vercel Hobby (Free) Plan Limits:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless function: 100 GB-hours
- ✅ 10 second function execution limit

**When to upgrade to Pro ($20/month):**
- Need longer function execution (60s)
- Need more bandwidth
- Need team collaboration features
- Need password protection

## Next Steps

1. Set up file storage solution (S3/Cloudinary)
2. Configure custom domain
3. Set up monitoring/error tracking
4. Enable Vercel Analytics
5. Set up staging/preview environments
6. Configure CI/CD pipelines

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Review this documentation
4. Check Vercel's documentation: [vercel.com/docs](https://vercel.com/docs)

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] JWT_SECRET is a strong random string
- [ ] MongoDB Atlas Network Access is configured
- [ ] CORS origins are properly restricted in production
- [ ] File upload limits are set appropriately
- [ ] API rate limiting is enabled
- [ ] Sensitive routes require authentication
- [ ] Email credentials use app-specific passwords
- [ ] No `.env` files are committed to git

---

🎉 **Congratulations!** Your DocumentorV3 application should now be fully functional on Vercel!
