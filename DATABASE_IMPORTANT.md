# ⚠️ IMPORTANT: Database Behavior on Vercel

## Current Setup: SQLite

The project currently uses SQLite, which **will work** on Vercel but with **critical limitations**:

### How It Works
1. On first request, the seed database (`yubla.sqlite`) is copied to `/tmp`
2. All reads/writes happen in `/tmp/yubla.sqlite`
3. Data persists during the serverless function's lifetime

### ⚠️ The Problem
**Data will be LOST when:**
- Vercel scales down (no requests for ~5 minutes)
- New deployment happens
- Function moves to different region
- Cold start occurs

### What This Means
- ✅ **Good for**: Testing, demos, development
- ❌ **Bad for**: Production, real user data
- 🔄 **Data resets**: Every time function restarts

## Example Scenario

```
User logs in → Creates data → Works fine
[5 minutes of no activity]
Function shuts down → Data LOST
Next user logs in → Sees fresh database again
```

## Solutions for Production

### Option 1: Vercel Postgres (Recommended) ⭐

**Pros:**
- Native Vercel integration
- Persistent storage
- Automatic backups
- Serverless-friendly

**Setup:**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# In Vercel dashboard:
# 1. Go to Storage tab
# 2. Create Postgres database
# 3. Connect to your project
```

**Cost:** Free tier available (60 hours compute/month)

### Option 2: PlanetScale (MySQL)

**Pros:**
- Generous free tier
- Serverless MySQL
- Great performance
- Easy branching

**Setup:**
```bash
npm install @planetscale/database
```

**Cost:** Free tier: 5GB storage, 1 billion row reads/month

### Option 3: Supabase (PostgreSQL)

**Pros:**
- PostgreSQL with extras
- Real-time features
- Authentication included
- Good free tier

**Setup:**
```bash
npm install @supabase/supabase-js
```

**Cost:** Free tier: 500MB database, 2GB bandwidth

### Option 4: Turso (SQLite in the cloud)

**Pros:**
- Keep SQLite syntax
- Edge-replicated
- Serverless-native
- Built for this use case

**Setup:**
```bash
npm install @libsql/client
```

**Cost:** Free tier: 9GB storage, 1B row reads

## Recommendation

For your school grades app, I recommend:

### For Testing/Demo
✅ **Keep current SQLite setup** - It's fine for demos

### For Production
⭐ **Use Vercel Postgres** - Best integration with Vercel

## Quick Migration Guide

I can help you migrate to any of these databases. The migration involves:

1. Update `api/lib/db-full.js` with new database connection
2. Convert SQL queries (if needed)
3. Run migration script to transfer data
4. Update environment variables

Would you like me to:
- [ ] Keep SQLite (demo/testing only)
- [ ] Migrate to Vercel Postgres (recommended)
- [ ] Migrate to PlanetScale
- [ ] Migrate to Supabase
- [ ] Migrate to Turso

## Current Status

✅ SQLite works on Vercel  
⚠️ Data resets on cold starts  
📝 Good for demos, not production  
🔄 Need persistent DB for real users  

## Testing the Current Setup

You can test the current SQLite setup:

```bash
# Deploy to Vercel
vercel --prod

# Test it
curl https://your-app.vercel.app/api/health

# Login and create data
# Wait 10 minutes
# Try to access data again → It will be reset
```

## Decision Time

**For your use case (school grades):**
- If this is a **demo/prototype**: Current SQLite is fine ✅
- If this is for **real schools**: You MUST use persistent database ⚠️

Let me know which path you want to take!
