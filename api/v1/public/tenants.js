import { initDb, listTenantsDb } from '../../lib/db.js';
import { withCors } from '../../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();

  const tenants = listTenantsDb()
    .filter((tenant) => tenant.active)
    .map((tenant) => ({ id: tenant.id, code: tenant.code, name: tenant.name, city: tenant.city }));
    
  res.json({ ok: true, tenants });
}

export default withCors(handler);
