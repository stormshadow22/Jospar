const express = require('express');
const path = require('path');
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin'});
  next();
});
app.get('/api/health', (req, res) => res.json({ok: true, mode: 'local'}));
// The browser uses Firebase SDK + rules. The obsolete Admin API bypassed those
// rules and used an incompatible profile/deletion model; keep it disabled.
app.use('/api', (req, res) => res.status(503).json({code: 'eConfiguration'}));
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir, {setHeaders(res, file) {
  if (/\.html$/.test(file)) res.set('Cache-Control', 'no-store');
  else if (/\.(?:js|css)$/.test(file)) res.set('Cache-Control', 'no-cache');
}}));
app.get('*', (req, res) => {
  if (path.extname(req.path)) return res.sendStatus(404);
  res.set('Cache-Control', 'no-store').sendFile(path.join(publicDir, 'index.html'));
});
app.use((err, req, res, next) => {
  console.error('Request failed:', err.code || err.name);
  res.status(500).json({code: 'eNet'});
});
if (require.main === module) {
  const port = process.env.PORT || 8089;
  app.listen(port, () => console.log('Jospar listening on http://localhost:' + port));
  if (process.env.JOSPAR_PUSH_WORKER === '1') require('./push-worker').startPushWorker().catch(err => console.error('Push worker not connected:', err.code || err.name));
}
module.exports = app;
