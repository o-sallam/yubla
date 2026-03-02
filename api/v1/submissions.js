import { 
  initDb, 
  getTenantSubmissionsDb, 
  addTenantSubmissionDb,
  findUserByIdDb,
  canTeacherAccessDb
} from '../lib/db.js';
import { withCors, withAuth, cleanText, toNumber } from '../lib/middleware.js';

const computeLevel = (recall, understand, hots, maxRecall, maxUnderstand, maxHots) => {
  if (maxRecall <= 0 || maxUnderstand <= 0 || maxHots <= 0) return '-';
  const pr = (recall / maxRecall) * 100;
  const pu = (understand / maxUnderstand) * 100;
  const ph = (hots / maxHots) * 100;
  if (pr < 50 || pu < 50 || ph < 50) return 'ضعيف';
  if (pr >= 80 && pu >= 80 && ph >= 80) return 'ممتاز';
  return 'جيد';
};

async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    let tenantId = req.auth.tenantId;
    if (req.auth.role === 'super_admin') {
      tenantId = cleanText(req.query.tenantId);
      if (!tenantId) {
        return res.status(400).json({ ok: false, error: 'tenantId is required for super_admin' });
      }
    }
    const rows = getTenantSubmissionsDb(tenantId);
    return res.json({ ok: true, rows });
  }

  if (req.method === 'POST') {
    const payload = req.body || {};
    const header = payload.header || {};
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    
    if (!rows.length) {
      return res.status(400).json({ ok: false, error: 'rows are required' });
    }

    const grade = cleanText(header.grade);
    const section = cleanText(header.section);
    const subject = cleanText(header.subject);
    const exam = cleanText(header.exam);

    const maxRecall = toNumber(header.maxRecall, 0);
    const maxUnderstand = toNumber(header.maxUnderstand, 0);
    const maxHots = toNumber(header.maxHots, 0);
    const totalMax = toNumber(header.totalMax, maxRecall + maxUnderstand + maxHots);
    const teacherNameInput = cleanText(header.teacherName);

    if (!grade || !section || !subject || !exam) {
      return res.status(400).json({ ok: false, error: 'grade, section, subject and exam are required' });
    }
    
    if (req.auth.role === 'school_admin' && !teacherNameInput) {
      return res.status(400).json({ ok: false, error: 'teacherName is required for school_admin submissions' });
    }
    
    if (req.auth.role === 'teacher' && !canTeacherAccessDb(req.auth.tenantId, req.auth.userId, grade, section, subject)) {
      return res.status(403).json({ ok: false, error: 'Access denied for selected grade/section/subject' });
    }

    const authUser = findUserByIdDb(req.auth.userId);
    const teacherName = req.auth.role === 'teacher' ? authUser?.displayName || authUser?.username || '' : teacherNameInput;

    const batchId = `${Date.now()}`;
    const timestamp = new Date().toISOString();
    let inserted = 0;

    for (const row of rows) {
      const studentName = cleanText(row.studentName);
      if (!studentName) continue;

      const recall = toNumber(row.recall, 0);
      const understand = toNumber(row.understand, 0);
      const hots = toNumber(row.hots, 0);
      const total = recall + understand + hots;

      if (recall > maxRecall || understand > maxUnderstand || hots > maxHots) {
        return res.status(400).json({ ok: false, error: `Mark exceeds max limits for ${studentName}` });
      }

      const level = computeLevel(recall, understand, hots, maxRecall, maxUnderstand, maxHots);
      const outRow = {
        timestamp,
        batchId,
        teacherName,
        grade,
        section,
        subject,
        exam,
        maxRecall,
        maxUnderstand,
        maxHots,
        totalMax,
        studentName,
        recall,
        understand,
        hots,
        total,
        plan: cleanText(row.plan),
        level
      };
      if (addTenantSubmissionDb(req.auth.tenantId, outRow)) inserted += 1;
    }

    return res.json({ ok: true, batchId, inserted });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

export default withCors(withAuth(handler, ['school_admin', 'teacher', 'super_admin']));
