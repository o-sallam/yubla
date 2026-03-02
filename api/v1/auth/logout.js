import { initDb, deleteSessionDb } from '../../lib/db.js';
import { withCors, withAuth } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();
  deleteSessionDb(req.auth.id);
  res.json({ ok: true });
}

export default withCors(withAuth(handler));
