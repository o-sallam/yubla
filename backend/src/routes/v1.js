import { Router } from 'express';
import {
  addTenantSubmissionDb,
  bootstrapTenantDemoDb,
  buildTeacherScopedLookupsDb,
  canTeacherAccessDb,
  createTenantDb,
  createUserDb,
  deactivateStudentDb,
  deactivateTeacherDb,
  deleteExpiredSessionsDb,
  deleteSessionDb,
  findSessionDb,
  findTenantByCodeDb,
  findTenantByIdDb,
  findUserByIdDb,
  findUserByUsernameDb,
  getSystemStatsDb,
  getTenantAssignmentsDb,
  getTenantLookupsDb,
  getTenantStudentsDb,
  getTenantSubmissionsDb,
  listTenantsDb,
  listStudentsForSuperDb,
  listTeachersForSuperDb,
  listUsersDb,
  purgeSchoolDataDb,
  importStudentsRowsDb,
  importTeachersRowsDb,
  replaceTenantAssignmentsDb,
  replaceTenantStudentsDb,
  saveSessionDb,
  updateTenantDb,
  updateUserDb
} from '../data/db.js';
import { createSession, hashPassword, isSessionExpired, verifyPassword } from '../utils/security.js';

const router = Router();

const sanitizeUser = (user, options = {}) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName || user.username,
  role: user.role,
  tenantId: user.tenantId,
  active: user.active,
  ...(options.includePassword ? { passwordPlain: user.passwordPlain || '' } : {})
});

const computeLevel = (recall, understand, hots, maxRecall, maxUnderstand, maxHots) => {
  if (maxRecall <= 0 || maxUnderstand <= 0 || maxHots <= 0) return '-';
  const pr = (recall / maxRecall) * 100;
  const pu = (understand / maxUnderstand) * 100;
  const ph = (hots / maxHots) * 100;
  if (pr < 50 || pu < 50 || ph < 50) return 'ضعيف';
  if (pr >= 80 && pu >= 80 && ph >= 80) return 'ممتاز';
  return 'جيد';
};

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

const authRequired = (req, res, next) => {
  deleteExpiredSessionsDb();
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const sessionRow = findSessionDb(token);
  const session = sessionRow
    ? {
      id: sessionRow.id,
      userId: sessionRow.user_id,
      tenantId: sessionRow.tenant_id,
      role: sessionRow.role,
      expiresAt: sessionRow.expires_at
    }
    : null;

  if (!session || isSessionExpired(session)) {
    if (session) deleteSessionDb(token);
    return res.status(401).json({ ok: false, error: 'Session expired' });
  }

  req.auth = session;
  return next();
};

const rolesAllowed =
  (...roles) =>
    (req, res, next) => {
      if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      return next();
    };

const cleanText = (value) => String(value || '').trim();
const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

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

router.get('/health', (_req, res) => {
  res.json({ ok: true, version: 'v1' });
});

router.get('/public/tenants', (_req, res) => {
  const tenants = listTenantsDb()
    .filter((tenant) => tenant.active)
    .map((tenant) => ({ id: tenant.id, code: tenant.code, name: tenant.name, city: tenant.city }));
  res.json({ ok: true, tenants });
});

router.post('/auth/login', (req, res) => {
  const username = cleanText(req.body?.username).toLowerCase();
  const password = cleanText(req.body?.password);
  const tenantCode = cleanText(req.body?.tenantCode);

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'username and password are required' });
  }

  const user = findUserByUsernameDb(username);
  if (!user || !user.active) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  if (user.role !== 'super_admin' && tenantCode) {
    const tenant = findTenantByCodeDb(tenantCode);
    if (!tenant || !tenant.active || tenant.id !== user.tenantId) {
      return res.status(403).json({ ok: false, error: 'Tenant access denied' });
    }
  }

  const session = saveSessionDb(createSession(user));
  const tenant = user.tenantId ? findTenantByIdDb(user.tenantId) : null;
  return res.json({
    ok: true,
    accessToken: session.id,
    expiresAt: session.expiresAt,
    user: sanitizeUser(user),
    tenant
  });
});

router.post('/auth/logout', authRequired, (req, res) => {
  deleteSessionDb(req.auth.id);
  res.json({ ok: true });
});

router.get('/auth/me', authRequired, (req, res) => {
  const user = findUserByIdDb(req.auth.userId);
  const tenant = req.auth.tenantId ? findTenantByIdDb(req.auth.tenantId) : null;
  res.json({
    ok: true,
    session: {
      userId: req.auth.userId,
      role: req.auth.role,
      tenantId: req.auth.tenantId,
      expiresAt: req.auth.expiresAt
    },
    user: user ? sanitizeUser(user) : null,
    tenant
  });
});

router.patch('/auth/account', authRequired, (req, res) => {
  const currentPassword = cleanText(req.body?.currentPassword);
  const newUsername = cleanText(req.body?.newUsername).toLowerCase();
  const newPassword = cleanText(req.body?.newPassword);
  const newDisplayName = cleanText(req.body?.newDisplayName);

  if (!currentPassword) {
    return res.status(400).json({ ok: false, error: 'currentPassword is required' });
  }

  const user = findUserByIdDb(req.auth.userId);
  if (!user || !user.active) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return res.status(401).json({ ok: false, error: 'Current password is incorrect' });
  }

  const payload = {};
  if (newUsername && newUsername !== user.username) payload.username = newUsername;
  if (newPassword) {
    payload.passwordHash = hashPassword(newPassword);
    payload.passwordPlain = newPassword;
  }
  if (newDisplayName) payload.displayName = newDisplayName;

  if (!Object.keys(payload).length) {
    return res.status(400).json({ ok: false, error: 'No updates provided' });
  }

  const updated = updateUserDb(user.id, payload);
  if (!updated) {
    return res.status(409).json({ ok: false, error: 'Unable to update account (username may already exist)' });
  }

  return res.json({ ok: true, user: sanitizeUser(updated) });
});

router.get('/super/overview', authRequired, rolesAllowed('super_admin'), (_req, res) => {
  res.json({ ok: true, stats: getSystemStatsDb() });
});

router.get('/super/tenants', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const search = cleanText(req.query.search).toLowerCase();
  const page = Math.max(1, toNumber(req.query.page, 1));
  const pageSize = Math.min(200, Math.max(1, toNumber(req.query.pageSize, 20)));

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

  res.json({ ok: true, items, total, page, pageSize });
});

router.post('/super/tenants', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const code = cleanText(req.body?.code);
  const name = cleanText(req.body?.name);
  const city = cleanText(req.body?.city);
  const autoBootstrap = req.body?.autoBootstrap !== false;

  if (!code || !name) {
    return res.status(400).json({ ok: false, error: 'code and name are required' });
  }

  const tenant = createTenantDb({ code, name, city, active: true });
  if (!tenant) {
    return res.status(409).json({ ok: false, error: 'Tenant already exists or invalid data' });
  }

  if (autoBootstrap) {
    bootstrapTenantDemoDb({ tenantId: tenant.id, tenantCode: tenant.code, tenantName: tenant.name });
  }

  return res.status(201).json({ ok: true, tenant });
});

router.patch('/super/tenants/:tenantId', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const tenantId = cleanText(req.params.tenantId);
  const payload = {};
  if (req.body?.code !== undefined) payload.code = cleanText(req.body.code);
  if (req.body?.name !== undefined) payload.name = cleanText(req.body.name);
  if (req.body?.city !== undefined) payload.city = cleanText(req.body.city);
  if (req.body?.active !== undefined) payload.active = Boolean(req.body.active);

  const updated = updateTenantDb(tenantId, payload);
  if (!updated) {
    return res.status(400).json({ ok: false, error: 'Unable to update tenant' });
  }
  return res.json({ ok: true, tenant: updated });
});

router.post('/super/tenants/:tenantId/bootstrap', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const tenantId = cleanText(req.params.tenantId);
  const tenant = findTenantByIdDb(tenantId);
  if (!tenant) {
    return res.status(404).json({ ok: false, error: 'Tenant not found' });
  }
  bootstrapTenantDemoDb({ tenantId, tenantCode: tenant.code, tenantName: tenant.name });
  return res.json({ ok: true });
});

router.get('/super/users', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const tenantId = cleanText(req.query.tenantId) || null;
  const role = cleanText(req.query.role) || null;
  const search = cleanText(req.query.search) || '';
  const users = listUsersDb({ tenantId, role, search }).map((user) => sanitizeUser(user, { includePassword: true }));
  res.json({ ok: true, users });
});

router.post('/super/users', authRequired, rolesAllowed('super_admin'), (req, res) => {
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
});

router.patch('/super/users/:userId', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const userId = cleanText(req.params.userId);
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
});

router.get('/super/teachers', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const tenantId = cleanText(req.query.tenantId) || null;
  const search = cleanText(req.query.search) || '';
  const teachers = listTeachersForSuperDb({ tenantId, search });
  return res.json({ ok: true, teachers });
});

router.delete('/super/teachers/:userId', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const userId = cleanText(req.params.userId);
  if (!userId) return res.status(400).json({ ok: false, error: 'userId is required' });
  const ok = deactivateTeacherDb(userId);
  if (!ok) return res.status(404).json({ ok: false, error: 'Teacher not found' });
  return res.json({ ok: true });
});

router.get('/super/students', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const tenantId = cleanText(req.query.tenantId) || null;
  const search = cleanText(req.query.search) || '';
  const students = listStudentsForSuperDb({ tenantId, search });
  return res.json({ ok: true, students });
});

router.delete('/super/students/:studentId', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const studentId = toNumber(req.params.studentId, 0);
  if (!studentId) return res.status(400).json({ ok: false, error: 'studentId is required' });
  const ok = deactivateStudentDb(studentId);
  if (!ok) return res.status(404).json({ ok: false, error: 'Student not found' });
  return res.json({ ok: true });
});

router.post('/super/system/reset-schools', authRequired, rolesAllowed('super_admin'), (req, res) => {
  if (req.body?.confirm !== true) {
    return res.status(400).json({ ok: false, error: 'Confirmation is required' });
  }
  const report = purgeSchoolDataDb({ keepSessionId: req.auth.id });
  return res.json({ ok: true, report });
});

router.post('/super/import/teachers', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const tenantId = cleanText(req.body?.tenantId) || null;
  const defaultPassword = cleanText(req.body?.defaultPassword) || 'Teacher@123';

  if (!rows.length) {
    return res.status(400).json({ ok: false, error: 'rows are required' });
  }

  const normalizedRows = rows.map(normalizeTeacherImportRow);
  const report = importTeachersRowsDb(normalizedRows, { defaultTenantId: tenantId, defaultPassword });
  return res.json({ ok: true, report });
});

router.post('/super/import/students', authRequired, rolesAllowed('super_admin'), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const tenantId = cleanText(req.body?.tenantId) || null;

  if (!rows.length) {
    return res.status(400).json({ ok: false, error: 'rows are required' });
  }

  const normalizedRows = rows.map(normalizeStudentImportRow);
  const report = importStudentsRowsDb(normalizedRows, { defaultTenantId: tenantId });
  return res.json({ ok: true, report });
});

router.get('/admin/users', authRequired, rolesAllowed('school_admin'), (req, res) => {
  const users = listUsersDb({ tenantId: req.auth.tenantId }).map(sanitizeUser);
  res.json({ ok: true, users });
});

router.post('/admin/users', authRequired, rolesAllowed('school_admin'), (req, res) => {
  const username = cleanText(req.body?.username).toLowerCase();
  const displayName = cleanText(req.body?.displayName);
  const password = cleanText(req.body?.password);

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'username and password are required' });
  }

  const user = createUserDb({
    username,
    displayName: displayName || username,
    passwordPlain: password,
    passwordHash: hashPassword(password),
    role: 'teacher',
    tenantId: req.auth.tenantId,
    active: true
  });
  if (!user) {
    return res.status(409).json({ ok: false, error: 'Unable to create teacher account' });
  }
  return res.status(201).json({ ok: true, user: sanitizeUser(user) });
});

router.get('/admin/assignments', authRequired, rolesAllowed('school_admin'), (req, res) => {
  const assignments = getTenantAssignmentsDb(req.auth.tenantId);
  return res.json({ ok: true, assignments });
});

router.post('/admin/assignments/replace', authRequired, rolesAllowed('school_admin'), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const replaced = replaceTenantAssignmentsDb(req.auth.tenantId, rows);
  return res.json({ ok: true, replaced });
});

router.post('/admin/students/replace', authRequired, rolesAllowed('school_admin'), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const replaced = replaceTenantStudentsDb(req.auth.tenantId, rows);
  return res.json({ ok: true, replaced });
});

router.get('/lookups', authRequired, rolesAllowed('school_admin', 'teacher'), (req, res) => {
  const user = findUserByIdDb(req.auth.userId);
  const lookups =
    req.auth.role === 'teacher'
      ? buildTeacherScopedLookupsDb(req.auth.tenantId, user)
      : getTenantLookupsDb(req.auth.tenantId);
  if (!lookups) return res.status(404).json({ ok: false, error: 'Tenant not found' });
  return res.json({ ok: true, ...lookups });
});

router.get('/students', authRequired, rolesAllowed('school_admin', 'teacher'), (req, res) => {
  const grade = cleanText(req.query.grade);
  const section = cleanText(req.query.section);
  if (!grade || !section) {
    return res.status(400).json({ ok: false, error: 'grade and section are required' });
  }
  if (req.auth.role === 'teacher' && !canTeacherAccessDb(req.auth.tenantId, req.auth.userId, grade, section)) {
    return res.status(403).json({ ok: false, error: 'Access denied for selected class/section' });
  }
  const students = getTenantStudentsDb(req.auth.tenantId, grade, section);
  return res.json({ ok: true, students });
});

router.post('/submissions', authRequired, rolesAllowed('school_admin', 'teacher'), (req, res) => {
  const payload = req.body || {};
  const header = payload.header || {};
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!rows.length) return res.status(400).json({ ok: false, error: 'rows are required' });

  const grade = cleanText(header.grade);
  const section = cleanText(header.section);
  const subject = cleanText(header.subject);
  const exam = cleanText(header.exam);

  const maxRecall = toNumber(header.maxRecall, 0);
  const maxUnderstand = toNumber(header.maxUnderstand, 0);
  const maxHots = toNumber(header.maxHots, 0);
  const totalMax = toNumber(header.totalMax, maxRecall + maxUnderstand + maxHots);
  const teacherNameInput = cleanText(header.teacherName);

  if (!grade || !section || !subject || !exam) {
    return res.status(400).json({ ok: false, error: 'grade, section, subject and exam are required' });
  }
  if (req.auth.role === 'school_admin' && !teacherNameInput) {
    return res.status(400).json({ ok: false, error: 'teacherName is required for school_admin submissions' });
  }
  if (req.auth.role === 'teacher' && !canTeacherAccessDb(req.auth.tenantId, req.auth.userId, grade, section, subject)) {
    return res.status(403).json({ ok: false, error: 'Access denied for selected grade/section/subject' });
  }

  const authUser = findUserByIdDb(req.auth.userId);
  const teacherName = req.auth.role === 'teacher' ? authUser?.displayName || authUser?.username || '' : teacherNameInput;

  const batchId = `${Date.now()}`;
  const timestamp = new Date().toISOString();
  let inserted = 0;

  for (const row of rows) {
    const studentName = cleanText(row.studentName);
    if (!studentName) continue;

    const recall = toNumber(row.recall, 0);
    const understand = toNumber(row.understand, 0);
    const hots = toNumber(row.hots, 0);
    const total = recall + understand + hots;

    if (recall > maxRecall || understand > maxUnderstand || hots > maxHots) {
      return res.status(400).json({ ok: false, error: `Mark exceeds max limits for ${studentName}` });
    }

    const level = computeLevel(recall, understand, hots, maxRecall, maxUnderstand, maxHots);
    const outRow = {
      timestamp,
      batchId,
      teacherName,
      grade,
      section,
      subject,
      exam,
      maxRecall,
      maxUnderstand,
      maxHots,
      totalMax,
      studentName,
      recall,
      understand,
      hots,
      total,
      plan: cleanText(row.plan),
      level
    };
    if (addTenantSubmissionDb(req.auth.tenantId, outRow)) inserted += 1;
  }

  return res.json({ ok: true, batchId, inserted });
});

router.get('/submissions', authRequired, rolesAllowed('school_admin', 'teacher', 'super_admin'), (req, res) => {
  let tenantId = req.auth.tenantId;
  if (req.auth.role === 'super_admin') {
    tenantId = cleanText(req.query.tenantId);
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'tenantId is required for super_admin' });
    }
  }
  const rows = getTenantSubmissionsDb(tenantId);
  return res.json({ ok: true, rows });
});

export default router;
