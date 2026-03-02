# Yubla School Grades - Vercel Ready

This is the Vercel-ready version of the Yubla School Grades application, restructured as a monorepo with serverless API endpoints.

## Quick Start

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

1. Click the button above or go to [vercel.com](https://vercel.com)
2. Import your repository
3. Vercel will auto-detect the configuration
4. Click "Deploy"
5. Your app will be live in minutes!

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## What Changed?

### Before (Separate Backend/Frontend)
```
/backend  → Express server on port 3000
/frontend → Vite dev server on port 5173
```

### After (Vercel Monorepo)
```
/         → Vite app (frontend)
/api      → Serverless functions (backend)
```

## Project Structure

```
yubla/
├── api/                      # Serverless API (replaces backend/src)
│   ├── lib/
│   │   ├── db.js            # Database wrapper
│   │   ├── db-full.js       # Full DB implementation
│   │   ├── security.js      # Auth utilities
│   │   └── middleware.js    # Request helpers
│   ├── v1/
│   │   ├── auth/
│   │   │   ├── login.js     # POST /api/v1/auth/login
│   │   │   ├── logout.js    # POST /api/v1/auth/logout
│   │   │   └── me.js        # GET /api/v1/auth/me
│   │   ├── public/
│   │   │   └── tenants.js   # GET /api/v1/public/tenants
│   │   ├── lookups.js       # GET /api/v1/lookups
│   │   ├── students.js      # GET /api/v1/students
│   │   ├── submissions.js   # GET/POST /api/v1/submissions
│   │   └── health.js        # GET /api/v1/health
│   └── health.js            # GET /api/health
├── src/                     # Frontend React app (from frontend/src)
├── backend/                 # Original backend (reference only)
├── frontend/                # Original frontend (reference only)
├── yubla.sqlite            # Seed database
├── vercel.json             # Vercel configuration
├── vite.config.js          # Vite configuration
└── package.json            # Root dependencies
```

## API Endpoints

All endpoints are serverless functions:

### Public
- `GET /api/health` - Health check
- `GET /api/v1/health` - API v1 health check
- `GET /api/v1/public/tenants` - List active schools
- `POST /api/v1/auth/login` - Login

### Authenticated
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/lookups` - Get dropdown options
- `GET /api/v1/students?grade=X&section=Y` - Get students
- `GET /api/v1/submissions` - Get all submissions
- `POST /api/v1/submissions` - Create submission

## Default Credentials

### Super Admin
- Username: `super.admin`
- Password: `Admin@123`

### School Admin (Yubla)
- Username: `admin.yubla`
- Password: `Admin@123`
- Tenant Code: `YUBLA`

### Teacher (Yubla)
- Username: `teacher.yubla`
- Password: `Teacher@123`
- Tenant Code: `YUBLA`

## Database

The app uses SQLite with sql.js (in-memory):
- **Development**: Database persists in `/data` directory
- **Vercel**: Database copied to `/tmp` on cold start
- **Note**: Data resets on Vercel cold starts (use persistent DB for production)

### Migrating to Persistent Database

For production, migrate to:
- **Vercel Postgres** (recommended)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL/MySQL)

Update `api/lib/db-full.js` with your database connection.

## Environment Variables

No environment variables required for basic deployment.

Optional:
- `VERCEL=1` (auto-set by Vercel)
- `NODE_ENV=production` (auto-set by Vercel)

## CORS Configuration

CORS is automatically configured in `api/lib/middleware.js`:
- Development: Allows `localhost:5173`
- Production: Allows Vercel domain

## Testing Locally

### Test the serverless API locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run Vercel dev server
vercel dev
```

This simulates the Vercel environment locally.

### Or use the original backend:

```bash
cd backend
pnpm install
pnpm run dev
```

## Deployment Checklist

- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Vercel
- [ ] Vercel auto-detects configuration
- [ ] Deploy
- [ ] Test login with default credentials
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Set up persistent database

## Troubleshooting

### API returns 404
- Check that files are in `/api` directory
- Verify `vercel.json` configuration
- Check Vercel function logs

### Database resets
- This is expected on Vercel (serverless)
- Migrate to persistent database for production

### CORS errors
- Check `api/lib/middleware.js`
- Verify origin is allowed
- Check browser console for details

## Support

For issues or questions, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- Project issues on GitHub

## License

[Your License Here]
