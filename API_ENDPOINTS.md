# API Endpoints (Optimized for Vercel Free Tier)

The API has been optimized to use only **8 serverless functions** (Vercel free tier allows 12).

## Endpoint Structure

### 1. Health Check
- `GET /api/health` - Returns `{ ok: true, version: 'v1' }`

### 2. Authentication (`/api/v1/auth`)
All auth endpoints are combined in one serverless function:

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `PATCH /api/v1/auth/account` - Update account (requires auth)

### 3. Public Endpoints (`/api/v1/public`)
- `GET /api/v1/public/tenants` - List active schools (no auth required)

### 4. Admin Endpoints (`/api/v1/admin`)
School admin endpoints (requires school_admin role):

- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/users` - Create teacher
- `GET /api/v1/admin/assignments` - Get assignments
- `POST /api/v1/admin/assignments/replace` - Replace assignments
- `POST /api/v1/admin/students/replace` - Replace students

### 5. Super Admin Endpoints (`/api/v1/super`)
Platform admin endpoints (requires super_admin role):

- `GET /api/v1/super/overview` - System stats
- `GET /api/v1/super/tenants` - List tenants
- `GET /api/v1/super/users` - List users
- `POST /api/v1/super/users` - Create admin
- `PATCH /api/v1/super/users/:userId` - Update user
- `GET /api/v1/super/teachers` - List teachers
- `DELETE /api/v1/super/teachers/:userId` - Delete teacher
- `GET /api/v1/super/students` - List students
- `DELETE /api/v1/super/students/:studentId` - Delete student
- `POST /api/v1/super/system/reset-schools` - Reset all schools
- `POST /api/v1/super/import/teachers` - Import teachers
- `POST /api/v1/super/import/students` - Import students

### 6. Lookups
- `GET /api/v1/lookups` - Get dropdown options (requires auth)

### 7. Students
- `GET /api/v1/students?grade=X&section=Y` - Get students (requires auth)

### 8. Submissions
- `GET /api/v1/submissions` - Get all submissions (requires auth)
- `POST /api/v1/submissions` - Create submission (requires auth)

## Function Count: 8/12 ✅

We're using only 8 of the 12 allowed functions on Vercel's free tier, leaving room for future expansion.
