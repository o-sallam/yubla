# Yubla School Grades System

A multi-tenant school grades management system built with React and serverless architecture, ready for Vercel deployment.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Deploy in 30 seconds
npm install -g vercel
vercel --prod
```

## ⚠️ Important: Database Notice

**Current Setup:** SQLite (resets on cold starts)
- ✅ Perfect for: Demos, testing, development
- ❌ Not for: Production with real users

**For Production:** Migrate to Vercel Postgres
- 📖 Read: [DATABASE_IMPORTANT.md](./DATABASE_IMPORTANT.md)
- 🔄 Guide: [migrate-to-postgres.md](./migrate-to-postgres.md)

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Deploy in 3 steps
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - What was done
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide
- **[README.vercel.md](./README.vercel.md)** - Full documentation
- **[DATABASE_IMPORTANT.md](./DATABASE_IMPORTANT.md)** - Database behavior ⚠️

## 🏗️ Architecture

```
Frontend (React + Vite)
         ↓
Serverless API (/api)
         ↓
SQLite Database (in /tmp)
```

## 📁 Project Structure

```
yubla/
├── api/                    # Serverless API endpoints
│   ├── lib/               # Shared utilities
│   │   ├── db.js         # Database wrapper
│   │   ├── db-full.js    # Full implementation
│   │   ├── security.js   # Auth utilities
│   │   └── middleware.js # CORS, auth helpers
│   ├── v1/               # API v1 endpoints
│   │   ├── auth/         # Login, logout, me
│   │   ├── public/       # Public endpoints
│   │   ├── lookups.js    # Dropdown data
│   │   ├── students.js   # Student lists
│   │   └── submissions.js # Grade submissions
│   └── health.js         # Health check
├── src/                   # Frontend React app
├── backend/              # Original backend (reference)
├── frontend/             # Original frontend (reference)
├── yubla.sqlite          # Seed database
├── vercel.json           # Vercel config
└── package.json          # Dependencies
```

## 🔐 Default Credentials

### Super Admin
- Username: `super.admin`
- Password: `Admin@123`

### School Admin (Yubla)
- Username: `admin.yubla`
- Password: `Admin@123`
- Tenant: `YUBLA`

### Teacher (Yubla)
- Username: `teacher.yubla`
- Password: `Teacher@123`
- Tenant: `YUBLA`

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

## 📡 API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/v1/public/tenants` - List schools
- `POST /api/v1/auth/login` - Login

### Authenticated
- `GET /api/v1/auth/me` - Current user
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/lookups` - Dropdown options
- `GET /api/v1/students` - Student lists
- `GET /api/v1/submissions` - Grade submissions
- `POST /api/v1/submissions` - Submit grades

## ✨ Features

- ✅ Multi-tenant (multiple schools)
- ✅ Role-based access (Super Admin, School Admin, Teacher)
- ✅ Grade submission and tracking
- ✅ Student management
- ✅ Teacher assignments
- ✅ Arabic language support
- ✅ Responsive design
- ✅ Serverless architecture
- ✅ CORS configured
- ⚠️ SQLite (demo only - migrate for production)

## 🔄 Migration Path

### Current: SQLite (Demo)
```
Good for: Testing, demos, development
Issue: Data resets on cold starts
```

### Production: Vercel Postgres
```
Benefits: Persistent data, backups, scalable
Cost: Free tier available
Guide: See migrate-to-postgres.md
```

## 📦 Tech Stack

**Frontend:**
- React 18
- Vite 5
- Vanilla CSS

**Backend:**
- Vercel Serverless Functions
- Node.js
- sql.js (SQLite)

**Database:**
- SQLite (current - demo only)
- Vercel Postgres (recommended for production)

## 🚨 Before Production

- [ ] Read [DATABASE_IMPORTANT.md](./DATABASE_IMPORTANT.md)
- [ ] Migrate to Vercel Postgres
- [ ] Update default passwords
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Enable error tracking

## 📄 License

[Your License Here]

## 🤝 Support

For issues or questions:
- 📖 Check documentation files
- 🐛 Open an issue on GitHub
- 📧 Contact support

---

**Ready to deploy?** → [QUICKSTART.md](./QUICKSTART.md)

**Need help?** → [DEPLOYMENT.md](./DEPLOYMENT.md)

**Database questions?** → [DATABASE_IMPORTANT.md](./DATABASE_IMPORTANT.md)
