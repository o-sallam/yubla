# Vercel Cache Issue - How to Fix

## Problem

Vercel is serving a cached version of the frontend that still calls `localhost:3000`.

## Solution 1: Wait for Auto-Deployment

Vercel should automatically deploy the latest commit (`17531e3`). Wait 2-3 minutes and:

1. Hard refresh the page: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Check browser console for debug log showing:
   ```javascript
   Environment: {
     VITE_API_BASE: undefined,
     PROD: true,
     MODE: "production",
     apiBase: ""  // Should be empty string, not localhost!
   }
   ```

## Solution 2: Force Redeploy in Vercel Dashboard

If auto-deployment doesn't work:

1. Go to https://vercel.com/dashboard
2. Select your `yubla` project
3. Go to "Deployments" tab
4. Find the latest deployment
5. Click the three dots menu (⋯)
6. Click "Redeploy"
7. Check "Use existing Build Cache" should be **UNCHECKED**
8. Click "Redeploy"

## Solution 3: Clear Build Cache via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login
vercel login

# Link to project
vercel link

# Redeploy without cache
vercel --prod --force
```

## Solution 4: Manual Environment Variable

As a temporary workaround, set environment variable in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Go to "Settings" → "Environment Variables"
3. Add new variable:
   - **Name:** `VITE_API_BASE`
   - **Value:** `` (leave empty)
   - **Environment:** Production
4. Click "Save"
5. Go to "Deployments" → Redeploy latest

## Verification

After redeployment, check:

### 1. Browser Console
Should see:
```javascript
Environment: {
  VITE_API_BASE: undefined,
  PROD: true,
  MODE: "production",
  apiBase: ""  // Empty = relative paths
}
```

### 2. Network Tab
API calls should go to:
- ✅ `https://yubla.vercel.app/api/v1/auth/login`
- ❌ NOT `http://localhost:3000/api/v1/auth/login`

### 3. Test Login
Try logging in with `super.admin` / `Admin@123`

## Why This Happened

Vercel caches builds for faster deployments. Sometimes the cache doesn't invalidate properly when environment detection logic changes.

## Prevention

The debug logging added will help identify if this happens again:
```javascript
console.log('Environment:', {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
  apiBase: apiBase
});
```

## Current Status

✅ Code fixed and pushed (commit `17531e3`)  
⏳ Waiting for Vercel to rebuild  
📝 Debug logging added  
🔄 Build timestamp added to force cache invalidation  

---

**Next:** Wait 2-3 minutes, then hard refresh https://yubla.vercel.app
