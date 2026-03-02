import { initDb, findUserByUsernameDb, findTenantByCodeDb, findTenantByIdDb, saveSessionDb } from '../../lib/db.js';
import { createSession, verifyPassword } from '../../lib/security.js';
import { withCors, cleanText, sanitizeUser } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();

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
}

export default withCors(handler);
