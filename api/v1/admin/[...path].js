import {
  initDb,
  listUsersDb,
  createUserDb,
  getTenantAssignmentsDb,
  replaceTenantAssignmentsDb,
  replaceTenantStudentsDb
} from '../../lib/db.js';
import { hashPassword } from '../../lib/security.js';
import { withCors, withAuth, cleanText, sanitizeUser } from '../../lib/middleware.js';

async function adminHandler(req, res) {
  await initDb();

  const path = req.url.split('?')[0];

  // GET /api/v1/admin/users
  if (path.endsWith('/users') && req.method === 'GET') {
    const users = listUsersDb({ tenantId: req.auth.tenantId }).map(sanitizeUser);
    return res.json({ ok: true, users });
  }

  // POST /api/v1/admin/users
  if (path.endsWith('/users') && req.method === 'POST') {
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
  }

  // GET /api/v1/admin/assignments
  if (path.endsWith('/assignments') && req.method === 'GET') {
    const assignments = getTenantAssignmentsDb(req.auth.tenantId);
    return res.json({ ok: true, assignments });
  }

  // POST /api/v1/admin/assignments/replace
  if (path.endsWith('/assignments/replace') && req.method === 'POST') {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const replaced = replaceTenantAssignmentsDb(req.auth.tenantId, rows);
    return res.json({ ok: true, replaced });
  }

  // POST /api/v1/admin/students/replace
  if (path.endsWith('/students/replace') && req.method === 'POST') {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const replaced = replaceTenantStudentsDb(req.auth.tenantId, rows);
    return res.json({ ok: true, replaced });
  }

  return res.status(404).json({ ok: false, error: 'Not found' });
}

export default withCors(withAuth(adminHandler, ['school_admin']));
