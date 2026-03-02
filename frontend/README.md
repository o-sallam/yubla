# Original Frontend (Reference Only)

⚠️ **This directory is NOT used in production deployment.**

## Current Status

This is the **original frontend structure** kept for reference purposes only.

## Production Frontend

The production frontend has been moved to the **root directory**:

```
/ (root)
├── src/              # React source code (from frontend/src)
├── index.html        # Entry point (from frontend/index.html)
├── vite.config.js    # Vite config (from frontend/vite.config.js)
└── package.json      # Dependencies (merged)
```

## Why Keep This?

- Reference for original structure
- Backup of original configuration
- Documentation of migration

## Running Original Frontend (Optional)

If you want to run the original frontend locally:

```bash
cd frontend
pnpm install
pnpm run dev
```

This will start Vite on `http://localhost:5173`

## Deployment

❌ This directory is **excluded from Vercel deployment** via `.vercelignore`

✅ Production uses root `/src` directory instead

## Migration Notes

All files have been moved to root:
- ✅ `frontend/src/*` → `/src/*`
- ✅ `frontend/index.html` → `/index.html`
- ✅ `frontend/vite.config.js` → `/vite.config.js`
- ✅ `frontend/package.json` → `/package.json` (merged)

---

**For production deployment, see:** Root directory (`/src`, `/index.html`, etc.)
