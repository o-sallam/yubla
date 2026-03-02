import { useEffect } from 'react';
import bodyHtml from './legacy/body.html?raw';
import legacyScript from './legacy/legacyScript.js?raw';

function App() {
  useEffect(() => {
    // In production (Vercel), use relative path. In dev, use localhost or env var
    const apiBase = import.meta.env.VITE_API_BASE 
      ? import.meta.env.VITE_API_BASE.replace(/\/+$/, '')
      : (import.meta.env.PROD ? '' : 'http://localhost:3000');
    
    // Debug logging
    console.log('Environment:', {
      VITE_API_BASE: import.meta.env.VITE_API_BASE,
      PROD: import.meta.env.PROD,
      MODE: import.meta.env.MODE,
      apiBase: apiBase
    });
    
    window.__APP_API_BASE__ = apiBase;
    const runLegacy = new Function('API_BASE', legacyScript);
    runLegacy(apiBase);
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

export default App;
