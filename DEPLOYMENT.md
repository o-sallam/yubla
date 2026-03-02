# Yubla School Grades - Vercel Deployment Guide

This project has been restructured to work as a single repository on Vercel with serverless API endpoints.

## Project Structure

```
/
├── api/                    # Serverless API endpoints
│   ├── lib/               # Shared utilities
│   │   ├── db.js         # Database wrapper
│   │   ├── db-full.js    # Full database implementation
│   │   ├── security.js   # Auth utilities
│   │   └── middleware.js # Request helpers
│   ├── v1/               # API v1 endpoints
│   │   ├── auth/         # Authentication endpoints
│   │   ├── public/       # Public endpoints
│   │   ├── lookups.js
│   │   ├── students.js
│   │   └── submissions.js
│   └── health.js         # Health check
├── src/                   # Frontend React app
├── backend/              # Original backend (kept for reference)
├── frontend/             # Original frontend (kept for reference)
├── yubla.sqlite          # Seed database
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json

```

## Deployment Steps

### 1. Install Vercel CLI (optional)

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

### 3. Environment Variables

No environment variables are required for basic deployment. The app will work with default settings.

Optional environment variables:
- `NODE_ENV`: Set to `production` (auto-set by Vercel)

### 4. Database Handling

The SQLite database is handled differently in serverless:
- The seed database (`yubla.sqlite`) is included in the deployment
- On first request, it's copied to `/tmp` directory
- Data persists during the function's lifetime but may reset between cold starts
- For production, consider migrating to a persistent database (PostgreSQL, MySQL, etc.)

## API Endpoints

All API endpoints are available at `/api/*`:

- `GET /api/health` - Health check
- `GET /api/v1/health` - API v1 health check
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/public/tenants` - List tenants (public)
- `GET /api/v1/lookups` - Get lookups (authenticated)
- `GET /api/v1/students` - Get students (authenticated)
- `GET /api/v1/submissions` - Get submissions (authenticated)
- `POST /api/v1/submissions` - Create submission (authenticated)

## Local Development

### Run the full stack locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and API at `/api/*`.

### Run original backend separately (optional):

```bash
cd backend
pnpm install
pnpm run dev
```

## Notes

- The original `backend/` and `frontend/` directories are kept for reference
- The serverless API is in the `api/` directory
- Frontend source is in the root `src/` directory
- CORS is configured to allow requests from the Vercel domain

## Migrating to Persistent Database

For production use, consider migrating from SQLite to a persistent database:

1. **Vercel Postgres**: Native integration with Vercel
2. **PlanetScale**: MySQL-compatible serverless database
3. **Supabase**: PostgreSQL with real-time features
4. **Railway**: PostgreSQL, MySQL, or MongoDB

Update `api/lib/db-full.js` to connect to your chosen database.
