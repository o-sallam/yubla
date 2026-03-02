import { initDb, findUserByUsernameDb, findTenantByCodeDb, findTenantByIdDb, findUserByIdDb, updateUserDb, saveSessionDb, deleteSessionDb } from '../lib/db.js';
import { createSession, verifyPassword, hashPassword } from '../lib/security.js';
import { withCors, withAuth, cleanText, sanitizeUser } from '../lib/middleware.js';

async function authHandler(req, res) {
  await initDb();

  const path = req.url.split('?')[0];

  // POST /api/v1/auth/login
  if (path.endsWith('/login') && req.method === 'POST') {
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

  // All other routes require authentication
  return withAuth(async (req, res) => {
    // POST /api/v1/auth/logout
    if (path.endsWith('/logout') && req.method === 'POST') {
      deleteSessionDb(req.auth.id);
      return res.json({ ok: true });
    }

    // GET /api/v1/auth/me
    if (path.endsWith('/me') && req.method === 'GET') {
      const user = findUserByIdDb(req.auth.userId);
      const tenant = req.auth.tenantId ? findTenantByIdDb(req.auth.tenantId) : null;
      
      return res.json({
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

    // PATCH /api/v1/auth/account
    if (path.endsWith('/account') && req.method === 'PATCH') {
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
    }

    return res.status(404).json({ ok: false, error: 'Not found' });
  })(req, res);
}

export default withCors(authHandler);
