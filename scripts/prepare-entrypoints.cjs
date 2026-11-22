const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.copyFileSync(path.join(root,'public/index.html'),path.join(root,'public/app.html'));
