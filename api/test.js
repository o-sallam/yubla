// Simple test endpoint to debug issues
export default async function handler(req, res) {
  try {
    // Test 1: Basic response
    const tests = {
      basic: 'OK',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    };

    // Test 2: Try importing sql.js
    try {
      const initSqlJs = (await import('sql.js')).default;
      tests.sqljs = 'imported';
      
      // Test 3: Try initializing sql.js
      try {
        const SQL = await initSqlJs();
        tests.sqlInit = 'initialized';
        
        // Test 4: Try creating a database
        try {
          const db = new SQL.Database();
          tests.dbCreate = 'created';
          db.close();
        } catch (e) {
          tests.dbCreate = `error: ${e.message}`;
        }
      } catch (e) {
        tests.sqlInit = `error: ${e.message}`;
      }
    } catch (e) {
      tests.sqljs = `error: ${e.message}`;
    }

    res.json({ ok: true, tests });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}
