# Pre-Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is ready.

## ✅ Code Preparation

- [ ] All code is committed to Git
- [ ] No sensitive data (passwords, API keys) in code
- [ ] `.env` files are in `.gitignore`
- [ ] All test files are excluded or in `.vercelignore`
- [ ] Dependencies are in `package.json` (not devDependencies)
- [ ] Code works locally with `npm start` (backend) and `npm start` (frontend)

## ✅ Configuration Files

- [ ] `vercel.json` exists in project root
- [ ] `api/index.js` exists (serverless entry point)
- [ ] `.vercelignore` exists
- [ ] `.gitignore` exists
- [ ] Package.json scripts include `vercel-build`

## ✅ MongoDB Atlas Setup

- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) created
- [ ] Database user created with strong password
- [ ] Network Access allows all IPs (0.0.0.0/0)
- [ ] Connection string copied and saved securely
- [ ] Database name included in connection string

## ✅ Environment Variables Prepared

Required variables ready:
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET` (generated random string)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (will get after first deploy)
- [ ] `REACT_APP_API_URL` (will get after first deploy)

Optional variables (if needed):
- [ ] Email: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- [ ] Chatbot: `OPENAI_API_KEY`

## ✅ GitHub Repository

- [ ] Repository created on GitHub
- [ ] All code pushed to main branch
- [ ] Repository is accessible (public or Vercel has access)
- [ ] Latest changes are committed

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## ✅ Vercel Account

- [ ] Vercel account created at vercel.com
- [ ] GitHub account connected to Vercel
- [ ] Payment method added (if needed for Pro features)

## ✅ Code Updates

- [ ] CORS configuration in `backend/server.js` includes production URL logic
- [ ] Frontend API service uses `REACT_APP_API_URL` environment variable
- [ ] No hardcoded localhost URLs in production code paths
- [ ] File upload paths are compatible with serverless (or cloud storage configured)

## ✅ Testing

- [ ] Backend runs locally: `cd backend && npm start`
- [ ] Frontend runs locally: `cd frontend && npm start`
- [ ] Can register/login locally
- [ ] Can submit forms locally
- [ ] Database connection works locally

## ✅ Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT.md exists with instructions
- [ ] Environment variables documented
- [ ] Known limitations documented

## ✅ After First Deployment

After deploying and getting your Vercel URL:

- [ ] Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] Update `FRONTEND_URL` environment variable
- [ ] Update `REACT_APP_API_URL` environment variable
- [ ] Update CORS origins in `backend/server.js` with actual URL
- [ ] Commit CORS changes and push to trigger redeploy
- [ ] Test deployed application thoroughly

## ✅ Post-Deployment Testing

- [ ] Homepage loads
- [ ] Static assets (images, CSS, JS) load
- [ ] API routes respond (check /api/...)
- [ ] Can register new user
- [ ] Can login
- [ ] Can submit enrollment
- [ ] Can request documents
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] File uploads work (temporarily)
- [ ] Email notifications work (if configured)
- [ ] Chatbot works (if configured)
- [ ] Mobile responsive

## ✅ Monitoring Setup

- [ ] Check Vercel deployment logs
- [ ] Check MongoDB Atlas logs
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for errors

## ✅ Production Hardening

- [ ] Set up cloud file storage (S3/Cloudinary)
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up backup strategy for MongoDB
- [ ] Configure rate limiting
- [ ] Set up staging environment
- [ ] Plan for database migrations

## 🚨 Common Issues to Check

- [ ] CORS errors → Update allowed origins
- [ ] Database connection → Check Atlas network access
- [ ] File uploads → Remember Vercel storage is ephemeral
- [ ] Environment variables → Must redeploy after adding them
- [ ] Build errors → Check Vercel deployment logs

## Commands Reference

```bash
# Test local build
npm run vercel-build

# Check for uncommitted changes
git status

# View current remote
git remote -v

# Push to GitHub
git push origin main

# Install all dependencies
npm run install-all
```

## Ready to Deploy? 

If all checks pass, proceed with deployment:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect configuration
4. Click Deploy
5. Wait for build to complete
6. Add environment variables
7. Update CORS and redeploy

## Need Help?

Refer to:
- `QUICK_DEPLOY.md` for step-by-step guide
- `DEPLOYMENT.md` for detailed documentation
- `.env.vercel.template` for environment variables list
