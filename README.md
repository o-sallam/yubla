# Yubla Platform (Multi-School)

نسخة مطورة من نظام إدخال العلامات تعمل كمنصة متعددة المدارس (Super Admin + School Admin + Teacher) باستخدام:

- `frontend`: React + Vite (واجهة RTL عربية)
- `backend`: Node.js + Express
- SQLite عبر `sql.js` (بدون أدوات C++ أو Visual Studio)

## 1) تشغيل المشروع

### Backend
```bash
cd backend
npm install
npm start
```

الخادم يعمل على: `http://localhost:4000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

الواجهة تعمل على: `http://localhost:3000`

## 2) البنية الحالية

- API أساسي: `backend/src/routes/v1.js`
- طبقة البيانات + seeding: `backend/src/data/db.js`
- واجهة legacy داخل React:
  - `frontend/src/legacy/body.html`
  - `frontend/src/legacy/legacyScript.js`
  - `frontend/src/styles/index.css`

## 3) ما تم تحسينه

- نظام صلاحيات واضح:
  - `super_admin`
  - `school_admin`
  - `teacher`
- عزل كامل للبيانات حسب المدرسة (tenant).
- شاشة Super Admin داخل نفس التطبيق.
- إعدادات الحساب عبر backend endpoint:
  - `PATCH /api/v1/auth/account`
- Seeder شامل (تشغيل تلقائي مرة واحدة حسب `seed_version`) يولّد:
  - 30 مدرسة
  - حسابات إدارات ومعلمات
  - 6600 طالبة تقريبًا
  - تكليفات تدريس واقعية
  - سجلات نتائج افتراضية للعرض

## 4) حسابات الدخول الافتراضية

- Super Admin:
  - Username: `super.admin`
  - Password: `Admin@123`
- YUBLA School Admin:
  - Username: `admin.yubla`
  - Password: `Admin@123`
- YUBLA Teacher:
  - Username: `teacher.yubla`
  - Password: `Teacher@123`

ملاحظة: لكل مدرسة حسابات إضافية تلقائية (admin + teachers) بنفس نمط كلمات المرور الافتراضية.

## 5) أهم Endpoints

- Auth:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`
  - `PATCH /api/v1/auth/account`
- Public:
  - `GET /api/v1/public/tenants`
- Teacher/Admin:
  - `GET /api/v1/lookups`
  - `GET /api/v1/students?grade=...&section=...`
  - `POST /api/v1/submissions`
  - `GET /api/v1/submissions`
  - `GET /api/v1/admin/assignments`
- Super Admin:
  - `GET /api/v1/super/overview`
  - `GET /api/v1/super/tenants`
  - `POST /api/v1/super/tenants`
  - `POST /api/v1/super/tenants/:tenantId/bootstrap`
  - `GET /api/v1/super/users`
  - `POST /api/v1/super/users`

## 6) ملاحظات

- قاعدة البيانات داخل:
  - `backend/data/yubla.sqlite`
- في حال الرغبة بإعادة توليد كامل البيانات الافتراضية:
  - احذف الملف `backend/data/yubla.sqlite`
  - ثم شغّل backend مجددًا.
