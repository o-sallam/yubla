import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import initSqlJs from 'sql.js';
import { hashPassword, verifyPassword } from '../utils/security.js';

const require = createRequire(import.meta.url);
const SQLJS_DIR = path.dirname(require.resolve('sql.js'));
const DB_DIR = process.env.DB_DIR ? path.resolve(process.env.DB_DIR) : path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'yubla.sqlite');

const SCHEMA_VERSION = '2026.02.platform.v1';
const SEED_VERSION = '2026.03.empty.v3';

const ROLE_VALUES = ['super_admin', 'school_admin', 'teacher'];

const GRADE_VALUES = ['سابع', 'ثامن', 'تاسع', 'عاشر', 'أول ثانوي', 'ثاني ثانوي'];
const SECTION_VALUES = ['أ', 'ب', 'ج'];
const SUBJECT_VALUES = [
  'لغة عربية',
  'لغة إنجليزية',
  'رياضيات',
  'علوم',
  'فيزياء',
  'كيمياء',
  'أحياء',
  'تربية إسلامية',
  'تاريخ',
  'جغرافيا'
];
const EXAM_VALUES = ['أول', 'ثاني', 'نهائي'];

const CITY_VALUES = [
  'عمّان',
  'إربد',
  'الزرقاء',
  'العقبة',
  'السلط',
  'مادبا',
  'الكرك',
  'معان',
  'جرش',
  'عجلون',
  'المفرق',
  'الطفيلة'
];

const SCHOOL_NAME_VALUES = [
  'مدرسة الريادة الثانوية للبنات',
  'مدرسة النهضة الثانوية للبنات',
  'مدرسة الإبداع الثانوية للبنات',
  'مدرسة الفاروق الثانوية للبنات',
  'مدرسة اليرموك الثانوية للبنات',
  'مدرسة الخنساء الثانوية للبنات',
  'مدرسة الزهراء الثانوية للبنات',
  'مدرسة الكرمل الثانوية للبنات',
  'مدرسة الأميرة بسمة الثانوية للبنات',
  'مدرسة المنار الثانوية للبنات',
  'مدرسة الحكمة الثانوية للبنات',
  'مدرسة القمم الثانوية للبنات'
];

const TEACHER_NAME_VALUES = [
  'سجود بدر العزام',
  'سعاد صالح',
  'هدى خالد',
  'ريم ياسين',
  'نورا الحسن',
  'مها الزعبي',
  'رنا القاسم',
  'دانا الخطيب',
  'ميساء شقيرات',
  'هبة الشناق',
  'سحر شحادة',
  'إيمان الحباشنة',
  'ليان العلي',
  'جنى البطاينة',
  'فرح الريماوي',
  'بيان النعيمات',
  'آية أبو غوش',
  'ابتسام النوافلة',
  'نسرين العوران',
  'أسماء السرحان',
  'علا الرياحي',
  'نورا العمري',
  'رغد الزبيدي',
  'عهد الخوالدة',
  'سمر الكيلاني',
  'عائشة الدهام',
  'لمى الغزاوي',
  'حنان الطراونة',
  'إسراء حياصات',
  'ميسون الفاعوري',
  'نهاد القضاة',
  'ميس القواسمة',
  'وفاء الطوالبة',
  'شيماء العدوان',
  'غدير الزيناتي',
  'بتول المومني',
  'إسراء الزيدان',
  'جمانة أبو زيد',
  'ياسمين عبيدات',
  'مروى الشريف',
  'عبير الحمد',
  'هيفاء الشديفات',
  'ديما بني هاني',
  'ندى الحوامدة',
  'آمال الشبول',
  'شهد الخلايلة',
  'مرام السردية',
  'لينا السوالمة'
];

const STUDENT_FIRST_NAMES = [
  'آية',
  'إسراء',
  'بتول',
  'بيان',
  'دانا',
  'ديما',
  'رنا',
  'ريم',
  'رغد',
  'سارة',
  'سجى',
  'سلمى',
  'سما',
  'شذى',
  'شهد',
  'ضياء',
  'عبير',
  'علا',
  'غدير',
  'فرح',
  'لجين',
  'لينا',
  'لمى',
  'مايا',
  'مها',
  'ميس',
  'ميساء',
  'ندى',
  'نسرين',
  'نور',
  'نورا',
  'هبة',
  'هيا',
  'ياسمين',
  'جنى',
  'جود',
  'جمانة',
  'حنين',
  'حلا',
  'خلود'
];

const STUDENT_LAST_NAMES = [
  'العزام',
  'الزعبي',
  'الخطيب',
  'النعيمات',
  'الريماوي',
  'العمري',
  'القضاة',
  'الخوالدة',
  'الشناق',
  'المومني',
  'السرحان',
  'الطراونة',
  'الحباشنة',
  'الكيلاني',
  'الدهام',
  'العبادي',
  'الرمامنة',
  'الحياصات',
  'السوالمة',
  'الخلايلة',
  'المعاني',
  'الشديفات',
  'الشرعة',
  'القاسم',
  'الفاعوري',
  'الحمود',
  'العوران',
  'عبيدات',
  'بني هاني',
  'الرحاحلة'
];

let SQL = null;
let db = null;

const ensureDir = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
};

const run = (sql, params = []) => {
  db.run(sql, params);
};

const getOne = (sql, params = []) => {
  const stmt = db.prepare(sql, params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
};

const getAll = (sql, params = []) => {
  const stmt = db.prepare(sql, params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const persist = () => {
  ensureDir();
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

const withTransaction = (fn) => {
  run('BEGIN');
  try {
    fn();
    run('COMMIT');
  } catch (error) {
    try {
      run('ROLLBACK');
    } catch {
      // ignore rollback failures
    }
    throw error;
  }
};

const nowIso = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeCode = (code) =>
  String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-');

const normalizeUsername = (username) => String(username || '').trim().toLowerCase();
const cleanText = (value) => String(value || '').trim();
const sanitizeUsernamePart = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');

const mapTenant = (row) =>
  row
    ? {
        id: row.id,
        code: row.code,
        name: row.name,
        city: row.city || '',
        active: Boolean(row.active),
        createdAt: row.created_at
      }
    : null;

const mapUser = (row) =>
  row
    ? {
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        employeeNo: row.employee_no || '',
        passwordPlain: row.password_plain || '',
        passwordHash: row.password_hash,
        role: row.role,
        tenantId: row.tenant_id,
        active: Boolean(row.active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    : null;

const createSchema = () => {
  run(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL DEFAULT '',
      employee_no TEXT NOT NULL DEFAULT '',
      password_plain TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'teacher')),
      tenant_id TEXT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tenant_id TEXT NULL,
      role TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS lookups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('teachers', 'grades', 'sections', 'subjects', 'exams')),
      value TEXT NOT NULL,
      UNIQUE (tenant_id, type, value)
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      student_no TEXT NOT NULL DEFAULT '',
      student_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS teacher_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      subject TEXT NOT NULL,
      UNIQUE (tenant_id, user_id, grade, section, subject)
    );
  `);

  run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      subject TEXT NOT NULL,
      exam TEXT NOT NULL,
      max_recall REAL NOT NULL,
      max_understand REAL NOT NULL,
      max_hots REAL NOT NULL,
      total_max REAL NOT NULL,
      student_name TEXT NOT NULL,
      recall REAL NOT NULL,
      understand REAL NOT NULL,
      hots REAL NOT NULL,
      total REAL NOT NULL,
      plan TEXT NOT NULL DEFAULT '',
      level TEXT NOT NULL DEFAULT '-'
    );
  `);

  run('CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users (tenant_id, role)');
  run('CREATE INDEX IF NOT EXISTS idx_students_tenant_grade_section ON students (tenant_id, grade, section)');
  run('CREATE INDEX IF NOT EXISTS idx_submissions_tenant ON submissions (tenant_id)');
  run('CREATE INDEX IF NOT EXISTS idx_assignments_tenant_user ON teacher_assignments (tenant_id, user_id)');
};

const ensureMigrations = () => {
  const addColumnIfMissing = (table, column, sql) => {
    const columns = getAll(`PRAGMA table_info(${table})`);
    if (!columns.some((col) => col.name === column)) {
      run(sql);
    }
  };

  addColumnIfMissing('users', 'display_name', "ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('users', 'employee_no', "ALTER TABLE users ADD COLUMN employee_no TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('users', 'password_plain', "ALTER TABLE users ADD COLUMN password_plain TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('users', 'updated_at', "ALTER TABLE users ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('tenants', 'city', "ALTER TABLE tenants ADD COLUMN city TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('students', 'student_no', "ALTER TABLE students ADD COLUMN student_no TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('students', 'active', 'ALTER TABLE students ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
  addColumnIfMissing('students', 'created_at', "ALTER TABLE students ADD COLUMN created_at TEXT NOT NULL DEFAULT ''");
  run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_employee_no ON users (tenant_id, employee_no) WHERE employee_no <> ''");
  run("CREATE UNIQUE INDEX IF NOT EXISTS idx_students_tenant_student_no ON students (tenant_id, student_no) WHERE student_no <> ''");
  run("UPDATE users SET updated_at = COALESCE(NULLIF(updated_at, ''), CURRENT_TIMESTAMP)");
  run("UPDATE students SET created_at = COALESCE(NULLIF(created_at, ''), CURRENT_TIMESTAMP)");

  const usersWithoutPlain = getAll(
    `
      SELECT id, role, username, employee_no, password_hash
      FROM users
      WHERE COALESCE(password_plain, '') = ''
    `
  );
  usersWithoutPlain.forEach((row) => {
    const candidates = [];
    if (row.role === 'super_admin' || row.role === 'school_admin') {
      candidates.push('Admin@123');
    }
    if (row.role === 'teacher') {
      candidates.push('Teacher@123');
      const employeeNo = cleanText(row.employee_no);
      if (employeeNo) candidates.push(`T@${employeeNo.slice(-6)}`);
    }
    const matched = candidates.find((candidate) => verifyPassword(candidate, String(row.password_hash || '')));
    if (matched) {
      run('UPDATE users SET password_plain = ? WHERE id = ?', [matched, row.id]);
    }
  });

  const teacherRows = getAll(
    `
      SELECT id, username, employee_no
      FROM users
      WHERE role = 'teacher'
    `
  );
  teacherRows.forEach((row) => {
    const currentUsername = normalizeUsername(row.username);
    if (!currentUsername.startsWith('t.')) return;

    const digits = String(row.employee_no || '').replace(/\D+/g, '');
    if (!digits) return;

    const base = `t${digits.slice(-6)}`;
    let candidate = base;
    let i = 1;
    while (getOne('SELECT id FROM users WHERE lower(username) = lower(?) AND id <> ?', [candidate, row.id])) {
      candidate = `${base}${i}`;
      i += 1;
    }

    if (candidate !== currentUsername) {
      run('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [candidate, row.id]);
    }
  });
};

const getMetaValue = (key) => {
  const row = getOne('SELECT value FROM app_meta WHERE key = ?', [key]);
  return row ? String(row.value) : null;
};

const setMetaValue = (key, value) => {
  run(
    `
    INSERT INTO app_meta (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `,
    [key, String(value)]
  );
};

const upsertTenantByCodeInternal = ({ id, code, name, city = '', active = 1 }) => {
  const normalizedCode = normalizeCode(code);
  const row = getOne('SELECT id FROM tenants WHERE lower(code) = lower(?)', [normalizedCode]);
  if (row) {
    run(
      `
      UPDATE tenants
      SET name = ?, city = ?, active = ?
      WHERE id = ?
    `,
      [name, city, active ? 1 : 0, row.id]
    );
    return row.id;
  }
  const tenantId = id || makeId('t');
  run(
    `
    INSERT INTO tenants (id, code, name, city, active)
    VALUES (?, ?, ?, ?, ?)
  `,
    [tenantId, normalizedCode, name, city, active ? 1 : 0]
  );
  return tenantId;
};

const buildTenantCodeFromSchoolNameInternal = (schoolName) => {
  const raw = cleanText(schoolName);
  const normalized = normalizeCode(raw)
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const base = (normalized || 'SCHOOL').slice(0, 18);
  let candidate = base;
  let i = 1;
  while (findTenantByCodeDb(candidate)) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
};

const ensureTenantBySchoolNameInternal = (schoolName) => {
  const cleanName = cleanText(schoolName);
  if (!cleanName) return null;
  const existing = findTenantByNameDb(cleanName);
  if (existing) return existing;
  const code = buildTenantCodeFromSchoolNameInternal(cleanName);
  const tenantId = upsertTenantByCodeInternal({
    id: `t-${code.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`,
    code,
    name: cleanName,
    city: '',
    active: 1
  });
  return findTenantByIdDb(tenantId);
};

const upsertUserByUsernameInternal = ({
  id,
  username,
  displayName,
  role,
  tenantId,
  password,
  active = 1
}) => {
  const normalizedUsername = normalizeUsername(username);
  const existing = getOne('SELECT id FROM users WHERE lower(username) = lower(?)', [normalizedUsername]);
  const userId = existing ? existing.id : id || makeId('u');
  const passwordHash = hashPassword(password);
  if (existing) {
    run(
      `
      UPDATE users
      SET username = ?, display_name = ?, role = ?, tenant_id = ?, active = ?, password_hash = ?, password_plain = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [normalizedUsername, displayName, role, tenantId || null, active ? 1 : 0, passwordHash, password, userId]
    );
  } else {
    run(
      `
      INSERT INTO users (id, username, display_name, password_hash, password_plain, role, tenant_id, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [userId, normalizedUsername, displayName, passwordHash, password, role, tenantId || null, active ? 1 : 0]
    );
  }
  return userId;
};

const replaceLookupValuesInternal = (tenantId, type, values) => {
  run('DELETE FROM lookups WHERE tenant_id = ? AND type = ?', [tenantId, type]);
  const uniqueValues = [...new Set((values || []).map((v) => cleanText(v)).filter(Boolean))];
  uniqueValues.forEach((value) => {
    run('INSERT INTO lookups (tenant_id, type, value) VALUES (?, ?, ?)', [tenantId, type, value]);
  });
};

const replaceTenantStudentsInternal = (tenantId, rows) => {
  run('DELETE FROM students WHERE tenant_id = ?', [tenantId]);
  rows.forEach((row) => {
    run(
      `
      INSERT INTO students (tenant_id, student_name, grade, section, active)
      VALUES (?, ?, ?, ?, 1)
    `,
      [tenantId, cleanText(row.studentName), cleanText(row.grade), cleanText(row.section)]
    );
  });
};

const replaceTenantAssignmentsInternal = (tenantId, rows) => {
  run('DELETE FROM teacher_assignments WHERE tenant_id = ?', [tenantId]);
  rows.forEach((row) => {
    if (!row.userId || !row.grade || !row.section || !row.subject) return;
    run(
      `
      INSERT OR IGNORE INTO teacher_assignments (tenant_id, user_id, grade, section, subject)
      VALUES (?, ?, ?, ?, ?)
    `,
      [tenantId, row.userId, cleanText(row.grade), cleanText(row.section), cleanText(row.subject)]
    );
  });
};

const syncTeacherLookupFromUsersInternal = (tenantId) => {
  const teacherNames = getAll(
    `
      SELECT display_name
      FROM users
      WHERE tenant_id = ? AND role = 'teacher' AND active = 1
      ORDER BY display_name
    `,
    [tenantId]
  ).map((row) => cleanText(row.display_name));
  replaceLookupValuesInternal(tenantId, 'teachers', teacherNames);
};

const buildSchoolCatalog = (targetCount = 30) => {
  const catalog = [
    { code: 'YUBLA', name: 'مدرسة يبلا الثانوية للبنات', city: 'إربد' },
    { code: 'DEMO', name: 'مدرسة تجريبية', city: 'عمّان' }
  ];

  for (let i = 1; catalog.length < targetCount; i += 1) {
    const code = `SCH${String(i).padStart(3, '0')}`;
    const city = CITY_VALUES[(i - 1) % CITY_VALUES.length];
    const schoolName = SCHOOL_NAME_VALUES[(i - 1) % SCHOOL_NAME_VALUES.length];
    catalog.push({
      code,
      name: `${schoolName} ${i}`,
      city
    });
  }

  return catalog;
};

const teacherSubjectMatrix = [
  ['رياضيات', 'علوم'],
  ['لغة عربية', 'تاريخ'],
  ['لغة إنجليزية', 'جغرافيا'],
  ['فيزياء', 'كيمياء'],
  ['أحياء', 'علوم'],
  ['تربية إسلامية', 'لغة عربية'],
  ['رياضيات', 'فيزياء'],
  ['لغة إنجليزية', 'أحياء']
];

const gradeWindows = [
  ['سابع', 'ثامن', 'تاسع'],
  ['ثامن', 'تاسع', 'عاشر'],
  ['تاسع', 'عاشر', 'أول ثانوي'],
  ['عاشر', 'أول ثانوي', 'ثاني ثانوي'],
  ['سابع', 'عاشر', 'ثاني ثانوي'],
  ['سابع', 'أول ثانوي', 'ثاني ثانوي'],
  ['ثامن', 'عاشر', 'ثاني ثانوي'],
  ['سابع', 'تاسع', 'أول ثانوي']
];

const sectionPairs = [
  ['أ', 'ب'],
  ['ب', 'ج'],
  ['أ', 'ج'],
  ['أ', 'ب'],
  ['ب', 'ج'],
  ['أ', 'ج'],
  ['أ', 'ب'],
  ['ب', 'ج']
];

const buildTeacherProfilesForTenant = (tenantCode, schoolIndex) => {
  const code = normalizeCode(tenantCode).toLowerCase();
  const profiles = [];

  for (let i = 0; i < 8; i += 1) {
    const poolIndex = (schoolIndex * 7 + i) % TEACHER_NAME_VALUES.length;
    const displayName = TEACHER_NAME_VALUES[poolIndex];
    let username = `teacher${i + 1}.${code}`;
    if (code === 'yubla') {
      username = i === 0 ? 'teacher.yubla' : `teacher${i + 1}.yubla`;
    } else if (code === 'demo') {
      username = i === 0 ? 'teacher.demo' : `teacher${i + 1}.demo`;
    }
    profiles.push({
      id: `u-${code}-teacher-${i + 1}`,
      username,
      displayName,
      role: 'teacher',
      password: 'Teacher@123'
    });
  }

  return profiles;
};

const buildAdminProfileForTenant = (tenantCode, tenantName) => {
  const code = normalizeCode(tenantCode).toLowerCase();
  let username = `admin.${code}`;
  if (code === 'yubla') username = 'admin.yubla';
  if (code === 'demo') username = 'admin.demo';
  return {
    id: `u-${code}-admin`,
    username,
    displayName: `مديرة ${tenantName}`,
    role: 'school_admin',
    password: 'Admin@123'
  };
};

const ensureSchoolAdminForTenantInternal = (tenant) => {
  if (!tenant?.id) return null;
  const existing = getOne(
    `
      SELECT id
      FROM users
      WHERE tenant_id = ? AND role = 'school_admin'
      ORDER BY created_at
      LIMIT 1
    `,
    [tenant.id]
  );
  if (existing?.id) return findUserByIdDb(existing.id);

  const base = `admin.${sanitizeUsernamePart(tenant.code) || 'school'}`;
  let username = base;
  let i = 1;
  while (findUserByUsernameDb(username)) {
    username = `${base}.${i}`;
    i += 1;
  }

  const userId = makeId('u');
  run(
    `
      INSERT INTO users (id, username, display_name, employee_no, password_hash, password_plain, role, tenant_id, active)
      VALUES (?, ?, ?, '', ?, 'Admin@123', 'school_admin', ?, 1)
    `,
    [userId, username, `مديرة ${tenant.name}`, hashPassword('Admin@123'), tenant.id]
  );
  return findUserByIdDb(userId);
};

const buildAssignmentsForTeachers = (teachers, tenantId) => {
  const assignments = [];
  teachers.forEach((teacher, index) => {
    const subjects = teacherSubjectMatrix[index % teacherSubjectMatrix.length];
    const grades = gradeWindows[index % gradeWindows.length];
    const sections = sectionPairs[index % sectionPairs.length];

    subjects.forEach((subject) => {
      grades.forEach((grade) => {
        sections.forEach((section) => {
          assignments.push({
            tenantId,
            userId: teacher.id,
            grade,
            section,
            subject
          });
        });
      });
    });
  });
  return assignments;
};

const buildStudentsForTenant = (schoolIndex, targetCount = 220) => {
  const combinations = [];
  GRADE_VALUES.forEach((grade) => {
    SECTION_VALUES.forEach((section) => {
      combinations.push({ grade, section });
    });
  });

  const rows = [];
  const used = new Set();
  for (let i = 0; i < targetCount; i += 1) {
    const combo = combinations[i % combinations.length];
    const first = STUDENT_FIRST_NAMES[(schoolIndex * 13 + i * 2) % STUDENT_FIRST_NAMES.length];
    const last = STUDENT_LAST_NAMES[(schoolIndex * 17 + i * 3) % STUDENT_LAST_NAMES.length];
    let studentName = `${first} ${last}`;
    if (used.has(studentName)) {
      studentName = `${studentName} ${String(i + 1).padStart(3, '0')}`;
    }
    used.add(studentName);
    rows.push({
      studentName,
      grade: combo.grade,
      section: combo.section
    });
  }
  return rows;
};

const scoreLevel = (recall, understand, hots, maxRecall, maxUnderstand, maxHots) => {
  if (maxRecall <= 0 || maxUnderstand <= 0 || maxHots <= 0) return '-';
  const r = (recall / maxRecall) * 100;
  const u = (understand / maxUnderstand) * 100;
  const h = (hots / maxHots) * 100;
  if (r < 50 || u < 50 || h < 50) return 'ضعيف';
  if (r >= 80 && u >= 80 && h >= 80) return 'ممتاز';
  return 'جيد';
};

const seedSubmissionsForTenantInternal = (tenantId) => {
  run("DELETE FROM submissions WHERE tenant_id = ? AND batch_id LIKE 'seedv3-%'", [tenantId]);

  const assignments = getAll(
    `
      SELECT a.user_id, a.grade, a.section, a.subject, u.display_name
      FROM teacher_assignments a
      JOIN users u ON u.id = a.user_id
      WHERE a.tenant_id = ?
      ORDER BY a.id
    `,
    [tenantId]
  );

  if (!assignments.length) return;

  assignments.forEach((assignment, assignmentIndex) => {
    const students = getAll(
      `
        SELECT student_name
        FROM students
        WHERE tenant_id = ? AND grade = ? AND section = ?
        ORDER BY id
        LIMIT 3
      `,
      [tenantId, assignment.grade, assignment.section]
    );

    if (!students.length) return;

    const exam = EXAM_VALUES[assignmentIndex % EXAM_VALUES.length];
    const maxRecall = 10;
    const maxUnderstand = 5;
    const maxHots = 5;
    const totalMax = 20;
    const batchId = `seedv3-${tenantId}-${assignmentIndex + 1}`;
    const timestamp = nowIso();

    students.forEach((student, studentIndex) => {
      const recall = 5 + ((assignmentIndex + studentIndex) % 6);
      const understand = 2 + ((assignmentIndex + studentIndex) % 4);
      const hots = 1 + ((assignmentIndex + studentIndex) % 5);
      const total = recall + understand + hots;
      const level = scoreLevel(recall, understand, hots, maxRecall, maxUnderstand, maxHots);

      run(
        `
          INSERT INTO submissions (
            tenant_id, timestamp, batch_id, teacher_name, grade, section, subject, exam,
            max_recall, max_understand, max_hots, total_max,
            student_name, recall, understand, hots, total, plan, level
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          tenantId,
          timestamp,
          batchId,
          assignment.display_name || '',
          assignment.grade || '',
          assignment.section || '',
          assignment.subject || '',
          exam,
          maxRecall,
          maxUnderstand,
          maxHots,
          totalMax,
          student.student_name || '',
          recall,
          understand,
          hots,
          total,
          level === 'ضعيف' ? 'متابعة علاجية' : '',
          level
        ]
      );
    });
  });
};

const bootstrapTenantDemoInternal = ({ tenantId, tenantCode, tenantName, schoolIndex }) => {
  const adminProfile = buildAdminProfileForTenant(tenantCode, tenantName);
  upsertUserByUsernameInternal({
    id: adminProfile.id,
    username: adminProfile.username,
    displayName: adminProfile.displayName,
    role: adminProfile.role,
    tenantId,
    password: adminProfile.password,
    active: 1
  });

  const teacherProfiles = buildTeacherProfilesForTenant(tenantCode, schoolIndex);
  teacherProfiles.forEach((teacher) => {
    upsertUserByUsernameInternal({
      id: teacher.id,
      username: teacher.username,
      displayName: teacher.displayName,
      role: teacher.role,
      tenantId,
      password: teacher.password,
      active: 1
    });
  });

  replaceLookupValuesInternal(tenantId, 'grades', GRADE_VALUES);
  replaceLookupValuesInternal(tenantId, 'sections', SECTION_VALUES);
  replaceLookupValuesInternal(tenantId, 'subjects', SUBJECT_VALUES);
  replaceLookupValuesInternal(tenantId, 'exams', EXAM_VALUES);
  syncTeacherLookupFromUsersInternal(tenantId);

  const students = buildStudentsForTenant(schoolIndex, 220);
  replaceTenantStudentsInternal(tenantId, students);

  const teachers = getAll(
    `
      SELECT id
      FROM users
      WHERE tenant_id = ? AND role = 'teacher'
      ORDER BY username
    `,
    [tenantId]
  ).map((row) => ({ id: row.id }));

  const assignments = buildAssignmentsForTeachers(teachers, tenantId);
  replaceTenantAssignmentsInternal(tenantId, assignments);
  seedSubmissionsForTenantInternal(tenantId);
};

const seedPlatformIfNeeded = () => {
  const currentSeedVersion = getMetaValue('seed_version');
  if (currentSeedVersion === SEED_VERSION) return;

  withTransaction(() => {
    run('DELETE FROM sessions');
    run('DELETE FROM submissions');
    run('DELETE FROM teacher_assignments');
    run('DELETE FROM students');
    run('DELETE FROM lookups');
    run('DELETE FROM users');
    run('DELETE FROM tenants');

    upsertUserByUsernameInternal({
      id: 'u-super-1',
      username: 'super.admin',
      displayName: 'مديرة النظام',
      role: 'super_admin',
      tenantId: null,
      password: 'Admin@123',
      active: 1
    });

    setMetaValue('seed_version', SEED_VERSION);
  });
};

const initDb = async () => {
  ensureDir();
  SQL = await initSqlJs({
    locateFile: (file) => path.join(SQLJS_DIR, file)
  });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(new Uint8Array(fileBuffer));
  } else {
    db = new SQL.Database();
  }

  createSchema();
  ensureMigrations();
  setMetaValue('schema_version', SCHEMA_VERSION);
  seedPlatformIfNeeded();
  deleteExpiredSessionsDb();
  persist();
};

const listTenantsDb = () => getAll('SELECT * FROM tenants ORDER BY name').map(mapTenant);
const findTenantByIdDb = (id) => mapTenant(getOne('SELECT * FROM tenants WHERE id = ?', [id]));
const findTenantByCodeDb = (code) =>
  mapTenant(getOne('SELECT * FROM tenants WHERE lower(code) = lower(?)', [normalizeCode(code)]));
const findTenantByNameDb = (name) => {
  const cleanName = cleanText(name);
  if (!cleanName) return null;
  const exact = mapTenant(getOne('SELECT * FROM tenants WHERE lower(trim(name)) = lower(trim(?))', [cleanName]));
  if (exact) return exact;
  return mapTenant(
    getOne(
      `
      SELECT *
      FROM tenants
      WHERE lower(name) LIKE ?
      ORDER BY length(name) ASC
      LIMIT 1
    `,
      [`%${cleanName.toLowerCase()}%`]
    )
  );
};

const createTenantDb = ({ code, name, city = '', active = true }) => {
  const normalizedCode = normalizeCode(code);
  const cleanName = cleanText(name);
  if (!normalizedCode || !cleanName) return null;
  if (findTenantByCodeDb(normalizedCode)) return null;

  const id = `t-${normalizedCode.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`;
  try {
    run(
      `
      INSERT INTO tenants (id, code, name, city, active)
      VALUES (?, ?, ?, ?, ?)
    `,
      [id, normalizedCode, cleanName, cleanText(city), active ? 1 : 0]
    );
    persist();
    return findTenantByIdDb(id);
  } catch {
    return null;
  }
};

const updateTenantDb = (tenantId, payload = {}) => {
  const existing = findTenantByIdDb(tenantId);
  if (!existing) return null;

  const nextCode = payload.code !== undefined ? normalizeCode(payload.code) : existing.code;
  const nextName = payload.name !== undefined ? cleanText(payload.name) : existing.name;
  const nextCity = payload.city !== undefined ? cleanText(payload.city) : existing.city;
  const nextActive = payload.active !== undefined ? Boolean(payload.active) : existing.active;

  if (!nextCode || !nextName) return null;

  const conflict = getOne('SELECT id FROM tenants WHERE lower(code) = lower(?) AND id <> ?', [nextCode, tenantId]);
  if (conflict) return null;

  try {
    run(
      `
      UPDATE tenants
      SET code = ?, name = ?, city = ?, active = ?
      WHERE id = ?
    `,
      [nextCode, nextName, nextCity, nextActive ? 1 : 0, tenantId]
    );
    persist();
    return findTenantByIdDb(tenantId);
  } catch {
    return null;
  }
};

const findUserByUsernameDb = (username) =>
  mapUser(getOne('SELECT * FROM users WHERE lower(username) = lower(?)', [normalizeUsername(username)]));

const findUserByIdDb = (id) => mapUser(getOne('SELECT * FROM users WHERE id = ?', [id]));

const listUsersDb = ({ tenantId = null, role = null, search = '' } = {}) => {
  const where = [];
  const params = [];

  if (tenantId) {
    where.push('tenant_id = ?');
    params.push(tenantId);
  }
  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  if (search) {
    where.push('(lower(username) LIKE ? OR lower(display_name) LIKE ?)');
    const pattern = `%${String(search).trim().toLowerCase()}%`;
    params.push(pattern, pattern);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return getAll(`SELECT * FROM users ${whereSql} ORDER BY role, display_name, username`, params).map(mapUser);
};

const createUserDb = ({
  username,
  displayName = '',
  employeeNo = '',
  passwordPlain = '',
  passwordHash,
  role,
  tenantId,
  active = true
}) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedRole = cleanText(role);
  const normalizedEmployeeNo = cleanText(employeeNo);

  if (!normalizedUsername || !passwordHash) return null;
  if (!ROLE_VALUES.includes(normalizedRole)) return null;
  if (normalizedRole !== 'super_admin' && !tenantId) return null;
  if (normalizedRole !== 'super_admin' && !findTenantByIdDb(tenantId)) return null;
  if (findUserByUsernameDb(normalizedUsername)) return null;

  const id = makeId('u');

  try {
    run(
      `
      INSERT INTO users (id, username, display_name, employee_no, password_hash, password_plain, role, tenant_id, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        normalizedUsername,
        cleanText(displayName) || normalizedUsername,
        normalizedEmployeeNo,
        passwordHash,
        cleanText(passwordPlain),
        normalizedRole,
        normalizedRole === 'super_admin' ? null : tenantId,
        active ? 1 : 0
      ]
    );

    if (normalizedRole === 'teacher' && tenantId) {
      syncTeacherLookupFromUsersInternal(tenantId);
    }

    persist();
    return findUserByIdDb(id);
  } catch {
    return null;
  }
};

const updateUserDb = (userId, payload = {}) => {
  const existing = findUserByIdDb(userId);
  if (!existing) return null;

  const nextUsername = payload.username !== undefined ? normalizeUsername(payload.username) : existing.username;
  const nextDisplayName =
    payload.displayName !== undefined ? cleanText(payload.displayName) : existing.displayName || existing.username;
  const nextRole = payload.role !== undefined ? cleanText(payload.role) : existing.role;
  const nextTenantId = payload.tenantId !== undefined ? payload.tenantId || null : existing.tenantId;
  const nextPasswordHash = payload.passwordHash !== undefined ? payload.passwordHash : existing.passwordHash;
  const nextPasswordPlain = payload.passwordPlain !== undefined ? cleanText(payload.passwordPlain) : existing.passwordPlain || '';
  const nextEmployeeNo = payload.employeeNo !== undefined ? cleanText(payload.employeeNo) : existing.employeeNo || '';
  const nextActive = payload.active !== undefined ? Boolean(payload.active) : existing.active;

  if (!nextUsername || !nextPasswordHash || !ROLE_VALUES.includes(nextRole)) return null;
  if (nextRole !== 'super_admin' && !nextTenantId) return null;
  if (nextRole !== 'super_admin' && !findTenantByIdDb(nextTenantId)) return null;

  const conflict = getOne('SELECT id FROM users WHERE lower(username) = lower(?) AND id <> ?', [nextUsername, userId]);
  if (conflict) return null;

  try {
    run(
      `
      UPDATE users
      SET username = ?, display_name = ?, employee_no = ?, password_hash = ?, password_plain = ?, role = ?, tenant_id = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        nextUsername,
        nextDisplayName || nextUsername,
        nextEmployeeNo,
        nextPasswordHash,
        nextPasswordPlain,
        nextRole,
        nextRole === 'super_admin' ? null : nextTenantId,
        nextActive ? 1 : 0,
        userId
      ]
    );

    if (existing.tenantId) {
      syncTeacherLookupFromUsersInternal(existing.tenantId);
    }
    if (nextTenantId && nextRole === 'teacher') {
      syncTeacherLookupFromUsersInternal(nextTenantId);
    }

    persist();
    return findUserByIdDb(userId);
  } catch {
    return null;
  }
};

const saveSessionDb = (session) => {
  run(
    `
    INSERT INTO sessions (id, user_id, tenant_id, role, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `,
    [session.id, session.userId, session.tenantId, session.role, session.expiresAt]
  );
  persist();
  return session;
};

const findSessionDb = (id) =>
  getOne('SELECT id, user_id, tenant_id, role, expires_at FROM sessions WHERE id = ?', [id]);

const deleteSessionDb = (id) => {
  run('DELETE FROM sessions WHERE id = ?', [id]);
  persist();
};

const deleteExpiredSessionsDb = () => {
  run('DELETE FROM sessions WHERE expires_at <= ?', [Date.now()]);
};

const getTenantLookupsDb = (tenantId) => {
  const lookups = { teachers: [], grades: [], sections: [], subjects: [], exams: [] };
  const rows = getAll(
    `
      SELECT type, value
      FROM lookups
      WHERE tenant_id = ?
      ORDER BY id
    `,
    [tenantId]
  );
  rows.forEach((row) => {
    if (lookups[row.type]) {
      lookups[row.type].push(String(row.value));
    }
  });
  const existingExams = lookups.exams.map((value) => cleanText(value)).filter(Boolean);
  lookups.exams = [...new Set([...EXAM_VALUES, ...existingExams])];
  return lookups;
};

const getTeacherAssignmentsDb = (tenantId, userId) =>
  getAll(
    `
      SELECT grade, section, subject
      FROM teacher_assignments
      WHERE tenant_id = ? AND user_id = ?
      ORDER BY grade, section, subject
    `,
    [tenantId, userId]
  ).map((row) => ({
    grade: String(row.grade),
    section: String(row.section),
    subject: String(row.subject)
  }));

const buildTeacherScopedLookupsDb = (tenantId, user) => {
  if (!tenantId || !user) return { teachers: [], grades: [], sections: [], subjects: [], exams: [] };
  const assignments = getTeacherAssignmentsDb(tenantId, user.id);
  const all = getTenantLookupsDb(tenantId);
  return {
    teachers: [user.displayName || user.username],
    grades: [...new Set(assignments.map((row) => row.grade))],
    sections: [...new Set(assignments.map((row) => row.section))],
    subjects: [...new Set(assignments.map((row) => row.subject))],
    exams: all.exams || []
  };
};

const canTeacherAccessDb = (tenantId, userId, grade, section, subject = null) => {
  const cleanGrade = cleanText(grade);
  const cleanSection = cleanText(section);
  if (!tenantId || !userId || !cleanGrade || !cleanSection) return false;

  if (subject) {
    const row = getOne(
      `
        SELECT 1 AS ok
        FROM teacher_assignments
        WHERE tenant_id = ? AND user_id = ? AND grade = ? AND section = ? AND subject = ?
        LIMIT 1
      `,
      [tenantId, userId, cleanGrade, cleanSection, cleanText(subject)]
    );
    return Boolean(row?.ok);
  }

  const row = getOne(
    `
      SELECT 1 AS ok
      FROM teacher_assignments
      WHERE tenant_id = ? AND user_id = ? AND grade = ? AND section = ?
      LIMIT 1
    `,
    [tenantId, userId, cleanGrade, cleanSection]
  );
  return Boolean(row?.ok);
};

const getTenantStudentsDb = (tenantId, grade, section) =>
  getAll(
    `
      SELECT student_name
      FROM students
      WHERE tenant_id = ? AND grade = ? AND section = ? AND active = 1
      ORDER BY student_name
    `,
    [tenantId, cleanText(grade), cleanText(section)]
  ).map((row) => String(row.student_name));

const getTenantAssignmentsDb = (tenantId) =>
  getAll(
    `
      SELECT a.user_id, u.display_name AS teacher_name, a.grade, a.section, a.subject
      FROM teacher_assignments a
      JOIN users u ON u.id = a.user_id
      WHERE a.tenant_id = ?
      ORDER BY u.display_name, a.grade, a.section, a.subject
    `,
    [tenantId]
  ).map((row) => ({
    userId: row.user_id,
    teacherName: row.teacher_name,
    grade: row.grade,
    section: row.section,
    subject: row.subject
  }));

const listTeachersForSuperDb = ({ tenantId = null, search = '' } = {}) => {
  const where = ["u.role = 'teacher'", 'u.active = 1'];
  const params = [];

  if (tenantId) {
    where.push('u.tenant_id = ?');
    params.push(tenantId);
  }
  if (search) {
    const pattern = `%${search.trim().toLowerCase()}%`;
    where.push(
      '(lower(u.display_name) LIKE ? OR lower(u.username) LIKE ? OR lower(u.employee_no) LIKE ? OR lower(t.name) LIKE ?)'
    );
    params.push(pattern, pattern, pattern, pattern);
  }

  return getAll(
    `
      SELECT u.id, u.username, u.display_name, u.employee_no, u.tenant_id, t.name AS school_name
      FROM users u
      LEFT JOIN tenants t ON t.id = u.tenant_id
      WHERE ${where.join(' AND ')}
      ORDER BY t.name, u.display_name, u.username
    `,
    params
  ).map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    employeeNo: row.employee_no || '',
    tenantId: row.tenant_id,
    schoolName: row.school_name || ''
  }));
};

const listStudentsForSuperDb = ({ tenantId = null, search = '' } = {}) => {
  const where = ['s.active = 1'];
  const params = [];

  if (tenantId) {
    where.push('s.tenant_id = ?');
    params.push(tenantId);
  }
  if (search) {
    const pattern = `%${search.trim().toLowerCase()}%`;
    where.push('(lower(s.student_name) LIKE ? OR lower(s.student_no) LIKE ? OR lower(t.name) LIKE ?)');
    params.push(pattern, pattern, pattern);
  }

  return getAll(
    `
      SELECT s.id, s.student_no, s.student_name, s.grade, s.section, s.tenant_id, t.name AS school_name
      FROM students s
      LEFT JOIN tenants t ON t.id = s.tenant_id
      WHERE ${where.join(' AND ')}
      ORDER BY t.name, s.grade, s.section, s.student_name
    `,
    params
  ).map((row) => ({
    id: Number(row.id),
    studentNo: row.student_no || '',
    studentName: row.student_name,
    grade: row.grade,
    section: row.section,
    tenantId: row.tenant_id,
    schoolName: row.school_name || ''
  }));
};

const deactivateTeacherDb = (userId) => {
  const user = findUserByIdDb(userId);
  if (!user || user.role !== 'teacher') return false;
  withTransaction(() => {
    run("UPDATE users SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'teacher'", [userId]);
    run('DELETE FROM teacher_assignments WHERE user_id = ?', [userId]);
    if (user.tenantId) syncTeacherLookupFromUsersInternal(user.tenantId);
  });
  persist();
  return true;
};

const deactivateStudentDb = (studentId) => {
  const row = getOne('SELECT id FROM students WHERE id = ?', [studentId]);
  if (!row?.id) return false;
  run('UPDATE students SET active = 0 WHERE id = ?', [studentId]);
  persist();
  return true;
};

const purgeSchoolDataDb = ({ keepSessionId = null } = {}) => {
  const report = {
    deletedTenants: Number(getOne('SELECT COUNT(*) AS c FROM tenants')?.c || 0),
    deletedSchoolAdmins: Number(getOne("SELECT COUNT(*) AS c FROM users WHERE role = 'school_admin'")?.c || 0),
    deletedTeachers: Number(getOne("SELECT COUNT(*) AS c FROM users WHERE role = 'teacher'")?.c || 0),
    deletedStudents: Number(getOne('SELECT COUNT(*) AS c FROM students')?.c || 0),
    deletedAssignments: Number(getOne('SELECT COUNT(*) AS c FROM teacher_assignments')?.c || 0),
    deletedSubmissions: Number(getOne('SELECT COUNT(*) AS c FROM submissions')?.c || 0),
    deletedLookups: Number(getOne('SELECT COUNT(*) AS c FROM lookups')?.c || 0)
  };

  withTransaction(() => {
    run('DELETE FROM submissions');
    run('DELETE FROM teacher_assignments');
    run('DELETE FROM students');
    run('DELETE FROM lookups');
    run("DELETE FROM users WHERE role <> 'super_admin'");
    run('DELETE FROM tenants');
    if (keepSessionId) {
      run('DELETE FROM sessions WHERE id <> ?', [keepSessionId]);
    } else {
      run('DELETE FROM sessions');
    }
  });

  persist();
  return report;
};

const replaceTenantStudentsDb = (tenantId, rows) => {
  const cleanRows = (rows || [])
    .map((row) => ({
      studentName: cleanText(row.studentName || row.student_name),
      grade: cleanText(row.grade),
      section: cleanText(row.section)
    }))
    .filter((row) => row.studentName && row.grade && row.section);

  withTransaction(() => {
    replaceTenantStudentsInternal(tenantId, cleanRows);
  });
  persist();
  return cleanRows.length;
};

const replaceTenantAssignmentsDb = (tenantId, rows) => {
  const cleanRows = (rows || [])
    .map((row) => ({
      userId: cleanText(row.userId || row.user_id),
      grade: cleanText(row.grade),
      section: cleanText(row.section),
      subject: cleanText(row.subject)
    }))
    .filter((row) => row.userId && row.grade && row.section && row.subject);

  withTransaction(() => {
    replaceTenantAssignmentsInternal(tenantId, cleanRows);
    syncTeacherLookupFromUsersInternal(tenantId);
  });
  persist();
  return cleanRows.length;
};

const resolveTenantForImportInternal = (schoolName, defaultTenantId = null) => {
  if (defaultTenantId) {
    const tenant = findTenantByIdDb(defaultTenantId);
    if (tenant) return tenant;
  }
  const key = cleanText(schoolName);
  if (!key) return null;
  return findTenantByCodeDb(key) || findTenantByNameDb(key) || ensureTenantBySchoolNameInternal(key);
};

const ensureLookupValueInternal = (tenantId, type, value) => {
  const cleanValue = cleanText(value);
  if (!tenantId || !cleanValue) return;
  run('INSERT OR IGNORE INTO lookups (tenant_id, type, value) VALUES (?, ?, ?)', [tenantId, type, cleanValue]);
};

const findTeacherByEmployeeNoDb = (tenantId, employeeNo) =>
  mapUser(
    getOne(
      `
      SELECT *
      FROM users
      WHERE tenant_id = ? AND role = 'teacher' AND employee_no = ?
      LIMIT 1
    `,
      [tenantId, cleanText(employeeNo)]
    )
  );

const buildTeacherImportUsernameInternal = ({ teacherNo }) => {
  const numPart = String(teacherNo || '')
    .replace(/\D+/g, '')
    .slice(-6);
  const base = numPart ? `t${numPart}` : `t${Date.now().toString(36).slice(-6)}`;
  let candidate = base;
  let i = 1;
  while (findUserByUsernameDb(candidate)) {
    candidate = `${base}${i}`;
    i += 1;
  }
  return candidate;
};

const importStudentsRowsDb = (rows, { defaultTenantId = null } = {}) => {
  const report = {
    total: Array.isArray(rows) ? rows.length : 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };
  if (!Array.isArray(rows) || !rows.length) return report;

  withTransaction(() => {
    rows.forEach((rawRow, index) => {
      const line = index + 2;
      const schoolName = cleanText(rawRow.schoolName || rawRow.school || rawRow.tenantName);
      const studentNo = cleanText(rawRow.studentNo || rawRow.student_no || rawRow.idNo);
      const studentName = cleanText(rawRow.studentName || rawRow.student_name || rawRow.name);
      const grade = cleanText(rawRow.grade);
      const section = cleanText(rawRow.section);
      const tenant = resolveTenantForImportInternal(schoolName, defaultTenantId);
      if (tenant) ensureSchoolAdminForTenantInternal(tenant);

      if (!tenant) {
        report.errors.push(`السطر ${line}: تعذر تحديد المدرسة (${schoolName || 'بدون اسم'})`);
        return;
      }
      if (!studentName || !grade || !section) {
        report.errors.push(`السطر ${line}: البيانات ناقصة للطالبة`);
        return;
      }

      try {
        let existing = null;
        if (studentNo) {
          existing = getOne('SELECT id FROM students WHERE tenant_id = ? AND student_no = ? LIMIT 1', [tenant.id, studentNo]);
        }
        if (!existing) {
          existing = getOne(
            `
            SELECT id
            FROM students
            WHERE tenant_id = ? AND student_name = ? AND grade = ? AND section = ?
            LIMIT 1
          `,
            [tenant.id, studentName, grade, section]
          );
        }

        if (existing) {
          run(
            `
            UPDATE students
            SET student_no = CASE WHEN ? <> '' THEN ? ELSE student_no END,
                student_name = ?,
                grade = ?,
                section = ?,
                active = 1
            WHERE id = ?
          `,
            [studentNo, studentNo, studentName, grade, section, existing.id]
          );
          report.updated += 1;
        } else {
          run(
            `
            INSERT INTO students (tenant_id, student_no, student_name, grade, section, active)
            VALUES (?, ?, ?, ?, ?, 1)
          `,
            [tenant.id, studentNo, studentName, grade, section]
          );
          report.inserted += 1;
        }

        ensureLookupValueInternal(tenant.id, 'grades', grade);
        ensureLookupValueInternal(tenant.id, 'sections', section);
      } catch (error) {
        report.errors.push(`السطر ${line}: ${error.message}`);
      }
    });
  });

  persist();
  return report;
};

const importTeachersRowsDb = (rows, { defaultTenantId = null, defaultPassword = 'Teacher@123' } = {}) => {
  const report = {
    total: Array.isArray(rows) ? rows.length : 0,
    teachersCreated: 0,
    teachersUpdated: 0,
    assignmentsInserted: 0,
    assignmentsSkipped: 0,
    errors: []
  };
  if (!Array.isArray(rows) || !rows.length) return report;

  const touchedTenantIds = new Set();

  withTransaction(() => {
    rows.forEach((rawRow, index) => {
      const line = index + 2;
      const schoolName = cleanText(rawRow.schoolName || rawRow.school || rawRow.tenantName);
      const teacherNo = cleanText(rawRow.teacherNo || rawRow.teacher_no || rawRow.employeeNo || rawRow.employee_no);
      const teacherName = cleanText(rawRow.teacherName || rawRow.teacher_name || rawRow.name);
      const grade = cleanText(rawRow.grade);
      const section = cleanText(rawRow.section);
      const subject = cleanText(rawRow.subject);
      const tenant = resolveTenantForImportInternal(schoolName, defaultTenantId);
      if (tenant) ensureSchoolAdminForTenantInternal(tenant);

      if (!tenant) {
        report.errors.push(`السطر ${line}: تعذر تحديد المدرسة (${schoolName || 'بدون اسم'})`);
        return;
      }
      if (!teacherName || !grade || !section || !subject) {
        report.errors.push(`السطر ${line}: البيانات ناقصة للمعلمة أو المادة/الصف/الشعبة`);
        return;
      }

      try {
        let teacher = null;
        if (teacherNo) {
          teacher = findTeacherByEmployeeNoDb(tenant.id, teacherNo);
        }
        if (!teacher) {
          teacher = mapUser(
            getOne(
              `
              SELECT *
              FROM users
              WHERE tenant_id = ? AND role = 'teacher' AND lower(display_name) = lower(?)
              LIMIT 1
            `,
              [tenant.id, teacherName]
            )
          );
        }

        if (!teacher) {
          const username = buildTeacherImportUsernameInternal({ tenantCode: tenant.code, teacherNo });
          const autoPassword = teacherNo ? `T@${teacherNo.slice(-6)}` : defaultPassword;
          const userId = makeId('u');
          run(
            `
            INSERT INTO users (id, username, display_name, employee_no, password_hash, password_plain, role, tenant_id, active)
            VALUES (?, ?, ?, ?, ?, ?, 'teacher', ?, 1)
          `,
            [userId, username, teacherName, teacherNo, hashPassword(autoPassword), autoPassword, tenant.id]
          );
          teacher = findUserByIdDb(userId);
          if (!teacher?.id) {
            report.errors.push(`السطر ${line}: تعذر إنشاء حساب للمعلمة ${teacherName}`);
            return;
          }
          report.teachersCreated += 1;
        } else {
          const needsUpdate = teacher.displayName !== teacherName || (teacherNo && teacher.employeeNo !== teacherNo);
          if (needsUpdate) {
            run(
              `
              UPDATE users
              SET display_name = ?,
                  employee_no = CASE WHEN ? <> '' THEN ? ELSE employee_no END,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
              [teacherName, teacherNo, teacherNo, teacher.id]
            );
            report.teachersUpdated += 1;
          }
        }

        const assignmentExists = getOne(
          `
          SELECT id
          FROM teacher_assignments
          WHERE tenant_id = ? AND user_id = ? AND grade = ? AND section = ? AND subject = ?
          LIMIT 1
        `,
          [tenant.id, teacher.id, grade, section, subject]
        );

        if (assignmentExists) {
          report.assignmentsSkipped += 1;
        } else {
          run(
            `
            INSERT INTO teacher_assignments (tenant_id, user_id, grade, section, subject)
            VALUES (?, ?, ?, ?, ?)
          `,
            [tenant.id, teacher.id, grade, section, subject]
          );
          report.assignmentsInserted += 1;
        }

        ensureLookupValueInternal(tenant.id, 'grades', grade);
        ensureLookupValueInternal(tenant.id, 'sections', section);
        ensureLookupValueInternal(tenant.id, 'subjects', subject);
        touchedTenantIds.add(tenant.id);
      } catch (error) {
        report.errors.push(`السطر ${line}: ${error.message}`);
      }
    });

    touchedTenantIds.forEach((tenantId) => syncTeacherLookupFromUsersInternal(tenantId));
  });

  persist();
  return report;
};

const bootstrapTenantDemoDb = ({ tenantId, tenantCode, tenantName }) => {
  if (!tenantId || !tenantCode || !tenantName) return false;
  withTransaction(() => {
    const schoolIndex = Math.max(1, normalizeCode(tenantCode).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 30);
    bootstrapTenantDemoInternal({ tenantId, tenantCode, tenantName, schoolIndex });
  });
  persist();
  return true;
};

const addTenantSubmissionDb = (tenantId, record) => {
  run(
    `
      INSERT INTO submissions (
        tenant_id, timestamp, batch_id, teacher_name, grade, section, subject, exam,
        max_recall, max_understand, max_hots, total_max,
        student_name, recall, understand, hots, total, plan, level
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tenantId,
      record.timestamp,
      record.batchId,
      record.teacherName,
      record.grade,
      record.section,
      record.subject,
      record.exam,
      record.maxRecall,
      record.maxUnderstand,
      record.maxHots,
      record.totalMax,
      record.studentName,
      record.recall,
      record.understand,
      record.hots,
      record.total,
      record.plan,
      record.level
    ]
  );
  persist();
  return true;
};

const getTenantSubmissionsDb = (tenantId) =>
  getAll(
    `
      SELECT timestamp, batch_id, teacher_name, grade, section, subject, exam,
             max_recall, max_understand, max_hots, total_max,
             student_name, recall, understand, hots, total, plan, level
      FROM submissions
      WHERE tenant_id = ?
      ORDER BY id DESC
    `,
    [tenantId]
  ).map((row) => [
    row.timestamp,
    row.batch_id,
    row.teacher_name,
    row.grade,
    row.section,
    row.subject,
    row.exam,
    row.max_recall,
    row.max_understand,
    row.max_hots,
    row.total_max,
    row.student_name,
    row.recall,
    row.understand,
    row.hots,
    row.total,
    row.plan,
    row.level
  ]);

const getSystemStatsDb = () => {
  const toNumber = (row) => Number(row?.c || 0);
  return {
    tenants: toNumber(getOne('SELECT COUNT(*) AS c FROM tenants')),
    users: toNumber(getOne('SELECT COUNT(*) AS c FROM users')),
    students: toNumber(getOne('SELECT COUNT(*) AS c FROM students')),
    assignments: toNumber(getOne('SELECT COUNT(*) AS c FROM teacher_assignments')),
    submissions: toNumber(getOne('SELECT COUNT(*) AS c FROM submissions')),
    sessions: toNumber(getOne('SELECT COUNT(*) AS c FROM sessions'))
  };
};

export {
  DB_PATH,
  initDb,
  listTenantsDb,
  findTenantByIdDb,
  findTenantByCodeDb,
  findTenantByNameDb,
  createTenantDb,
  updateTenantDb,
  findUserByUsernameDb,
  findUserByIdDb,
  findTeacherByEmployeeNoDb,
  listUsersDb,
  createUserDb,
  updateUserDb,
  saveSessionDb,
  findSessionDb,
  deleteSessionDb,
  deleteExpiredSessionsDb,
  getTenantLookupsDb,
  getTenantAssignmentsDb,
  getTeacherAssignmentsDb,
  buildTeacherScopedLookupsDb,
  canTeacherAccessDb,
  getTenantStudentsDb,
  listTeachersForSuperDb,
  listStudentsForSuperDb,
  deactivateTeacherDb,
  deactivateStudentDb,
  purgeSchoolDataDb,
  replaceTenantStudentsDb,
  replaceTenantAssignmentsDb,
  importStudentsRowsDb,
  importTeachersRowsDb,
  bootstrapTenantDemoDb,
  addTenantSubmissionDb,
  getTenantSubmissionsDb,
  getSystemStatsDb
};
