# Migrate to Vercel Postgres (Optional)

If you want persistent data storage, follow these steps to migrate from SQLite to Vercel Postgres.

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a name (e.g., "yubla-db")
7. Click "Create"

Vercel will automatically add environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

## Step 2: Install Dependencies

```bash
npm install @vercel/postgres
```

## Step 3: Create New Database Handler

I can create a new `api/lib/db-postgres.js` file that:
- Connects to Vercel Postgres
- Keeps the same function signatures
- Migrates your schema
- Seeds initial data

## Step 4: Update API Endpoints

Change imports from:
```javascript
import { initDb, findUserByUsernameDb } from '../lib/db.js';
```

To:
```javascript
import { initDb, findUserByUsernameDb } from '../lib/db-postgres.js';
```

## Step 5: Deploy

```bash
vercel --prod
```

## Benefits After Migration

✅ Data persists forever  
✅ No more resets on cold starts  
✅ Better performance  
✅ Automatic backups  
✅ Can handle concurrent users  
✅ Production-ready  

## Cost

**Vercel Postgres Free Tier:**
- 256 MB storage
- 60 hours compute/month
- 256 MB data transfer

**Paid Tier (if needed):**
- Starts at $20/month
- More storage and compute

## Do You Want Me to Create the Migration?

I can create:
1. `api/lib/db-postgres.js` - Postgres database handler
2. `scripts/migrate-data.js` - Data migration script
3. Updated documentation

Just let me know if you want to proceed with Postgres migration!

## Alternative: Keep SQLite for Now

If this is just for testing/demo, the current SQLite setup is fine. You can always migrate later when you're ready for production.

**Current SQLite is good for:**
- Development
- Testing
- Demos
- Prototypes
- Learning

**Migrate to Postgres when:**
- Going to production
- Need persistent data
- Have real users
- Need reliability
