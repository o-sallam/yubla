# 🚀 Quick Start Guide

## Deploy to Vercel in 3 Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "Restructured for Vercel deployment"
git push
```

### Step 2: Deploy to Vercel
Go to [vercel.com](https://vercel.com) and:
1. Click "Add New Project"
2. Import your repository
3. Click "Deploy" (no configuration needed!)

### Step 3: Done! 🎉
Your app is live at `https://your-project.vercel.app`

---

## Or Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Test Locally First

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

---

## Login Credentials

**Super Admin:**
- Username: `super.admin`
- Password: `Admin@123`

**School Admin:**
- Username: `admin.yubla`  
- Password: `Admin@123`
- Tenant: `YUBLA`

---

## What's Included

✅ Frontend (React + Vite)  
✅ Serverless API (13 endpoints)  
✅ SQLite database with seed data  
✅ Authentication system  
✅ Multi-tenant support  
✅ CORS configured  
⚠️ **Note:** SQLite resets on cold starts - use Postgres for production

## ⚠️ Important: Database Behavior

**Current Setup (SQLite):**
- ✅ Works for demos and testing
- ⚠️ Data resets when function restarts (~5 min idle)
- ❌ Not suitable for production with real users

**For Production:**
- 📖 Read [DATABASE_IMPORTANT.md](./DATABASE_IMPORTANT.md)
- 🔄 Migrate to Vercel Postgres (recommended)
- 📖 See [migrate-to-postgres.md](./migrate-to-postgres.md)  

---

## Need Help?

- 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- 📖 Read [README.vercel.md](./README.vercel.md) for full docs
- 📖 Read [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for what was done

---

## Project Structure

```
/
├── api/          # Serverless API endpoints
├── src/          # Frontend React app
├── vercel.json   # Vercel configuration
├── package.json  # Dependencies
└── yubla.sqlite  # Seed database
```

That's it! You're ready to deploy. 🚀
