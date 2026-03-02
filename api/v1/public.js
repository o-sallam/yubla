import { initDb, listTenantsDb } from '../lib/db.js';
import { withCors } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();

  const path = req.url.split('?')[0];

  // GET /api/v1/public/tenants
  if (path.endsWith('/tenants')) {
    const tenants = listTenantsDb()
      .filter((tenant) => tenant.active)
      .map((tenant) => ({ id: tenant.id, code: tenant.code, name: tenant.name, city: tenant.city }));
      
    return res.json({ ok: true, tenants });
  }

  return res.status(404).json({ ok: false, error: 'Not found' });
}

export default withCors(handler);
