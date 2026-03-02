# Original Backend (Reference Only)

⚠️ **This directory is NOT used in production deployment.**

## Current Status

This is the **original Express.js backend** kept for reference purposes only.

## Production Backend

The production backend has been migrated to **serverless functions** in the `/api` directory:

```
/api
├── lib/              # Shared utilities (db, security, middleware)
├── v1/
│   ├── auth.js      # Authentication endpoints
│   ├── public.js    # Public endpoints
│   ├── lookups.js   # Lookups
│   ├── students.js  # Students
│   └── submissions.js # Submissions
└── health.js        # Health check
```

## Why Keep This?

- Reference for original implementation
- Comparison with serverless version
- Local development alternative (if needed)
- Documentation of migration

## Running Original Backend (Optional)

If you want to run the original backend locally:

```bash
cd backend
pnpm install
pnpm run dev
```

This will start the Express server on `http://localhost:3000`

## Deployment

❌ This directory is **excluded from Vercel deployment** via `.vercelignore`

✅ Production uses `/api` serverless functions instead

## Migration Notes

All functionality from this backend has been migrated to serverless functions:
- ✅ Database operations → `/api/lib/db-full.js`
- ✅ Authentication → `/api/lib/security.js`
- ✅ Routes → `/api/v1/*.js`
- ✅ Middleware → `/api/lib/middleware.js`

---

**For production deployment, see:** `/api` directory
