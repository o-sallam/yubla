import {
  initDb,
  getSystemStatsDb,
  listTenantsDb,
  listUsersDb,
  listTeachersForSuperDb,
  listStudentsForSuperDb,
  createUserDb,
  updateUserDb,
  deactivateTeacherDb,
  deactivateStudentDb,
  purgeSchoolDataDb,
  importTeachersRowsDb,
  importStudentsRowsDb
} from '../lib/db.js';
import { hashPassword } from '../lib/security.js';
import { withCors, withAuth, cleanText, toNumber, sanitizeUser } from '../lib/middleware.js';

const normalizeTeacherImportRow = (row) => ({
  schoolName: cleanText(row?.schoolName || row?.school || row?.['اسم المدرسة'] || row?.['المدرسة']),
  grade: cleanText(row?.grade || row?.['الصف']),
  section: cleanText(row?.section || row?.['الشعبة']),
  subject: cleanText(row?.subject || row?.['المادة']),
  teacherName: cleanText(row?.teacherName || row?.name || row?.['اسم'] || row?.['المعلمة']),
  teacherNo: cleanText(row?.teacherNo || row?.employeeNo || row?.['رقم المعلمة'])
});

const normalizeStudentImportRow = (row) => ({
  schoolName: cleanText(row?.schoolName || row?.school || row?.['اسم المدرسة'] || row?.['المدرسة']),
  grade: cleanText(row?.grade || row?.['الصف']),
  section: cleanText(row?.section || row?.['الشعبة']),
  studentName: cleanText(row?.studentName || row?.name || row?.['اسم الطالبة']),
  studentNo: cleanText(row?.studentNo || row?.idNo || row?.['رقم الطالبة'])
});

async function superHandler(req, res) {
  await initDb();

  const path = req.url.split('?')[0];
  const query = new URL(req.url, `http://${req.headers.host}`).searchParams;

  // GET /api/v1/super/overview
  if (path.endsWith('/overview') && req.method === 'GET') {
    return res.json({ ok: true, stats: getSystemStatsDb() });
  }

  // GET /api/v1/super/tenants
  if (path.endsWith('/tenants') && req.method === 'GET') {
    const search = cleanText(query.get('search')).toLowerCase();
    const page = Math.max(1, toNumber(query.get('page'), 1));
    const pageSize = Math.min(200, Math.max(1, toNumber(query.get('pageSize'), 20)));

    const rows = listTenantsDb().filter((tenant) => {
      if (!search) return true;
      return (
        tenant.name.toLowerCase().includes(search) ||
        tenant.code.toLowerCase().includes(search) ||
        (tenant.city || '').toLowerCase().includes(search)
      );
    });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    return res.json({ ok: true, items, total, page, pageSize });
  }

  // GET /api/v1/super/users
  if (path.endsWith('/users') && req.method === 'GET') {
    const tenantId = cleanText(query.get('tenantId')) || null;
    const role = cleanText(query.get('role')) || null;
    const search = cleanText(query.get('search')) || '';
    const users = listUsersDb({ tenantId, role, search }).map((user) => sanitizeUser(user, { includePassword: true }));
    return res.json({ ok: true, users });
  }

  // POST /api/v1/super/users
  if (path.endsWith('/users') && req.method === 'POST') {
    const username = cleanText(req.body?.username).toLowerCase();
    const displayName = cleanText(req.body?.displayName);
    const password = cleanText(req.body?.password);
    const role = cleanText(req.body?.role);
    const tenantId = cleanText(req.body?.tenantId) || null;
    const active = req.body?.active !== false;

    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, error: 'username, password and role are required' });
    }

    if (role !== 'super_admin') {
      return res.status(400).json({ ok: false, error: 'Only platform admin accounts can be created manually' });
    }
    if (tenantId) {
      return res.status(400).json({ ok: false, error: 'tenantId is not allowed for platform admin accounts' });
    }

    const user = createUserDb({
      username,
      displayName: displayName || username,
      passwordPlain: password,
      passwordHash: hashPassword(password),
      role,
      tenantId,
      active
    });
    if (!user) {
      return res.status(409).json({ ok: false, error: 'Unable to create user (duplicate or invalid tenant)' });
    }
    return res.status(201).json({ ok: true, user: sanitizeUser(user, { includePassword: true }) });
  }

  // PATCH /api/v1/super/users/:userId
  if (path.match(/\/users\/[^/]+$/) && req.method === 'PATCH') {
    const userId = path.split('/').pop();
    const payload = {};
    if (req.body?.username !== undefined) payload.username = cleanText(req.body.username).toLowerCase();
    if (req.body?.displayName !== undefined) payload.displayName = cleanText(req.body.displayName);
    if (req.body?.password !== undefined && cleanText(req.body.password)) {
      payload.passwordHash = hashPassword(cleanText(req.body.password));
      payload.passwordPlain = cleanText(req.body.password);
    }
    if (req.body?.role !== undefined) payload.role = cleanText(req.body.role);
    if (req.body?.tenantId !== undefined) payload.tenantId = cleanText(req.body.tenantId) || null;
    if (req.body?.active !== undefined) payload.active = Boolean(req.body.active);

    const updated = updateUserDb(userId, payload);
    if (!updated) {
      return res.status(400).json({ ok: false, error: 'Unable to update user' });
    }
    return res.json({ ok: true, user: sanitizeUser(updated, { includePassword: true }) });
  }

  // GET /api/v1/super/teachers
  if (path.endsWith('/teachers') && req.method === 'GET') {
    const tenantId = cleanText(query.get('tenantId')) || null;
    const search = cleanText(query.get('search')) || '';
    const teachers = listTeachersForSuperDb({ tenantId, search });
    return res.json({ ok: true, teachers });
  }

  // DELETE /api/v1/super/teachers/:userId
  if (path.match(/\/teachers\/[^/]+$/) && req.method === 'DELETE') {
    const userId = path.split('/').pop();
    if (!userId) return res.status(400).json({ ok: false, error: 'userId is required' });
    const ok = deactivateTeacherDb(userId);
    if (!ok) return res.status(404).json({ ok: false, error: 'Teacher not found' });
    return res.json({ ok: true });
  }

  // GET /api/v1/super/students
  if (path.endsWith('/students') && req.method === 'GET') {
    const tenantId = cleanText(query.get('tenantId')) || null;
    const search = cleanText(query.get('search')) || '';
    const students = listStudentsForSuperDb({ tenantId, search });
    return res.json({ ok: true, students });
  }

  // DELETE /api/v1/super/students/:studentId
  if (path.match(/\/students\/[^/]+$/) && req.method === 'DELETE') {
    const studentId = toNumber(path.split('/').pop(), 0);
    if (!studentId) return res.status(400).json({ ok: false, error: 'studentId is required' });
    const ok = deactivateStudentDb(studentId);
    if (!ok) return res.status(404).json({ ok: false, error: 'Student not found' });
    return res.json({ ok: true });
  }

  // POST /api/v1/super/system/reset-schools
  if (path.endsWith('/reset-schools') && req.method === 'POST') {
    if (req.body?.confirm !== true) {
      return res.status(400).json({ ok: false, error: 'Confirmation is required' });
    }
    const report = purgeSchoolDataDb({ keepSessionId: req.auth.id });
    return res.json({ ok: true, report });
  }

  // POST /api/v1/super/import/teachers
  if (path.endsWith('/import/teachers') && req.method === 'POST') {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const tenantId = cleanText(req.body?.tenantId) || null;
    const defaultPassword = cleanText(req.body?.defaultPassword) || 'Teacher@123';

    if (!rows.length) {
      return res.status(400).json({ ok: false, error: 'rows are required' });
    }

    const normalizedRows = rows.map(normalizeTeacherImportRow);
    const report = importTeachersRowsDb(normalizedRows, { defaultTenantId: tenantId, defaultPassword });
    return res.json({ ok: true, report });
  }

  // POST /api/v1/super/import/students
  if (path.endsWith('/import/students') && req.method === 'POST') {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const tenantId = cleanText(req.body?.tenantId) || null;

    if (!rows.length) {
      return res.status(400).json({ ok: false, error: 'rows are required' });
    }

    const normalizedRows = rows.map(normalizeStudentImportRow);
    const report = importStudentsRowsDb(normalizedRows, { defaultTenantId: tenantId });
    return res.json({ ok: true, report });
  }

  return res.status(404).json({ ok: false, error: 'Not found' });
}

export default withCors(withAuth(superHandler, ['super_admin']));
