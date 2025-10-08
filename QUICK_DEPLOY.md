# Quick Deploy to Vercel - Checklist

## Before You Start

- [/] Have a GitHub account
- [/] Have a Vercel account (free)
- [/] Have MongoDB Atlas account (free)
- [/] Your code is committed to Git

## MongoDB Atlas Setup (5 minutes)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create free cluster (M0)
3. Create database user: 
   - Username: `documentor_user`
   - Password: (generate strong password, save it!)
4. Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)
5. Database → Connect → Connect your application
6. Copy connection string: `mongodb+srv://documentor_user:secretndeitoungpassword:)@cluster.mongodb.net/documentor`


## Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Deploy to Vercel (10 minutes)

### 1. Import Project
- Go to [vercel.com](https://vercel.com)
- Click **"Add New Project"**
- Import from GitHub (authorize if needed)
- Select your repository

### 2. Configure Project
Vercel will auto-detect settings. Just click **Deploy** for now.

### 3. Add Environment Variables
After first deployment, go to:
**Settings** → **Environment Variables**

Add these (minimum required):

```
MONGODB_URI = mongodb+srv://documentor_user:YOUR_PASSWORD@cluster.mongodb.net/documentor
JWT_SECRET = ndeitoungsecretlods
NODE_ENV = production
REACT_APP_API_URL = https://your-app-name.vercel.app
FRONTEND_URL = https://your-app-name.vercel.app
```

**Optional (for email features):**
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
EMAIL_FROM = noreply@yourschool.edu
```

**Optional (for chatbot):**
```
OPENAI_API_KEY = sk-your-key-here
```

### 4. Update CORS and Redeploy

After you get your Vercel URL (e.g., `https://documentor-v3-abc123.vercel.app`):

1. Edit `backend/server.js`, find this line:
```javascript
? [process.env.FRONTEND_URL, 'https://your-app.vercel.app']
```

2. Replace with your actual URL:
```javascript
? [process.env.FRONTEND_URL, 'https://documentor-v3-abc123.vercel.app']
```

3. Commit and push:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push
```

Vercel will auto-deploy!

### 5. Create Admin User

Option A: **MongoDB Atlas UI**
1. Go to Atlas → Browse Collections
2. Select `documentor` database → `users` collection
3. Click "Insert Document"
4. Add:
```json
{
  "name": "Admin User",
  "email": "admin@yourschool.edu",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

Option B: **Use Registration + Manual Role Update**
1. Register through your app UI
2. Go to MongoDB Atlas → users collection
3. Find your user, click edit
4. Change `"role": "student"` to `"role": "admin"`

## Test Your App ✅

Visit your Vercel URL:
- [ ] Homepage loads
- [ ] Can register/login
- [ ] Can submit enrollment
- [ ] Can request documents
- [ ] Admin can login
- [ ] Admin dashboard works

## Common Issues

### "Cannot connect to database"
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify MONGODB_URI environment variable is correct
- Redeploy after adding environment variables

### "CORS error"
- Update `backend/server.js` with your actual Vercel URL
- Set FRONTEND_URL environment variable
- Redeploy

### "Build failed"
- Check Vercel deployment logs
- Ensure all dependencies are in package.json
- Try local build: `npm run vercel-build`

## File Uploads Warning ⚠️

Vercel has **ephemeral storage** - uploaded files are temporary!

**Next steps** (after deployment works):
1. Set up AWS S3 bucket for permanent storage
2. Or use Cloudinary for images/documents
3. Or use Vercel Blob Storage

See `DEPLOYMENT.md` for detailed instructions.

## Get Your URL

Your app will be at: `https://your-project-name.vercel.app`

You can add a custom domain in Vercel Settings → Domains.

## Done! 🎉

Your DocumentorV3 is now live and fully functional!

**Next steps:**
- [ ] Read full `DEPLOYMENT.md` for advanced configuration
- [ ] Set up file storage solution (S3/Cloudinary)
- [ ] Configure custom domain
- [ ] Set up email notifications
- [ ] Test all features thoroughly

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs**: [docs.mongodb.com/cloud/](https://docs.mongodb.com/cloud/)
- **Check deployment logs** in Vercel Dashboard
