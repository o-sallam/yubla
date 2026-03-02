import {
  deleteExpiredSessionsDb,
  findSessionDb,
  deleteSessionDb
} from './db.js';
import { isSessionExpired } from './security.js';

export const cleanText = (value) => String(value || '').trim();

export const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

export const withAuth = (handler, allowedRoles = []) => {
  return async (req, res) => {
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

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    req.auth = session;
    return handler(req, res);
  };
};

export const withCors = (handler) => {
  return async (req, res) => {
    const origin = req.headers.origin || '';
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://192.168.1.15:5173'
    ];

    if (allowedOrigins.includes(origin) || process.env.VERCEL) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
};

export const sanitizeUser = (user, options = {}) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName || user.username,
  role: user.role,
  tenantId: user.tenantId,
  active: user.active,
  ...(options.includePassword ? { passwordPlain: user.passwordPlain || '' } : {})
});
