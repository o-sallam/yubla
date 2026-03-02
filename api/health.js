export default async function handler(req, res) {
  // Add test parameter to debug sql.js
  if (req.url.includes('?test=sql')) {
    try {
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs();
      const db = new SQL.Database();
      db.close();
      return res.json({ ok: true, version: 'v1', sqljs: 'working' });
    } catch (error) {
      return res.status(500).json({ 
        ok: false, 
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      });
    }
  }
  
  res.status(200).json({ ok: true, version: 'v1' });
}
