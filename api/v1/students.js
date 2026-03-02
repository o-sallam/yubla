import { initDb, getTenantStudentsDb, canTeacherAccessDb } from '../lib/db.js';
import { withCors, withAuth, cleanText } from '../lib/middleware.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  await initDb();

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
}

export default withCors(withAuth(handler, ['school_admin', 'teacher']));
