# API Endpoints (Optimized for Vercel Free Tier)

The API has been optimized to use only **6 serverless functions** (Vercel free tier allows 12).

## Endpoint Structure

### 1. Health Check
- `GET /api/health` - Returns `{ ok: true, version: 'v1' }`

### 2. Authentication (`/api/v1/auth`)
All auth endpoints are combined in one serverless function:

- `POST /api/v1/auth/login` - Login
  ```json
  {
    "username": "super.admin",
    "password": "Admin@123",
    "tenantCode": "YUBLA" // optional, required for non-super_admin
  }
  ```

- `POST /api/v1/auth/logout` - Logout (requires auth)
  ```
  Authorization: Bearer <token>
  ```

- `GET /api/v1/auth/me` - Get current user (requires auth)
  ```
  Authorization: Bearer <token>
  ```

### 3. Public Endpoints (`/api/v1/public`)
- `GET /api/v1/public/tenants` - List active schools (no auth required)

### 4. Lookups
- `GET /api/v1/lookups` - Get dropdown options (requires auth)
  ```
  Authorization: Bearer <token>
  ```

### 5. Students
- `GET /api/v1/students?grade=X&section=Y` - Get students (requires auth)
  ```
  Authorization: Bearer <token>
  ```

### 6. Submissions
- `GET /api/v1/submissions` - Get all submissions (requires auth)
- `POST /api/v1/submissions` - Create submission (requires auth)
  ```
  Authorization: Bearer <token>
  ```

## Usage Examples

### Login
```bash
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"super.admin","password":"Admin@123"}'
```

### Get Current User
```bash
curl https://your-app.vercel.app/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Tenants (Public)
```bash
curl https://your-app.vercel.app/api/v1/public/tenants
```

### Get Lookups
```bash
curl https://your-app.vercel.app/api/v1/lookups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Students
```bash
curl "https://your-app.vercel.app/api/v1/students?grade=8&section=A" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Function Count: 6/12 ✅

We're using only 6 of the 12 allowed functions on Vercel's free tier, leaving room for future expansion.

## Changes from Original

**Before (13 functions - exceeded limit):**
- `/api/health`
- `/api/v1/health`
- `/api/v1/auth/login`
- `/api/v1/auth/logout`
- `/api/v1/auth/me`
- `/api/v1/public/tenants`
- ... (7 more)

**After (6 functions - optimized):**
- `/api/health` (combined health checks)
- `/api/v1/auth` (handles /login, /logout, /me)
- `/api/v1/public` (handles /tenants)
- `/api/v1/lookups`
- `/api/v1/students`
- `/api/v1/submissions`

All endpoints work exactly the same from the client's perspective!
