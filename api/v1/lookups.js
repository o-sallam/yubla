import { initDb, findUserByIdDb, getTenantLookupsDb, buildTeacherScopedLookupsDb } from '../lib/db.js';
import { withCors, withAuth } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();

  const user = findUserByIdDb(req.auth.userId);
  const lookups =
    req.auth.role === 'teacher'
      ? buildTeacherScopedLookupsDb(req.auth.tenantId, user)
      : getTenantLookupsDb(req.auth.tenantId);
      
  if (!lookups) {
    return res.status(404).json({ ok: false, error: 'Tenant not found' });
  }
  
  return res.json({ ok: true, ...lookups });
}

export default withCors(withAuth(handler, ['school_admin', 'teacher']));
