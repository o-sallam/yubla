import { initDb, findUserByIdDb, findTenantByIdDb } from '../../lib/db.js';
import { withCors, withAuth, sanitizeUser } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();
  
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
}

export default withCors(withAuth(handler));
