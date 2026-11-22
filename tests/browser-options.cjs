const fs = require('node:fs');
const path = require('node:path');
const candidates = process.platform === 'win32' ? [
  path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.PROGRAMFILES || '', 'Microsoft/Edge/Application/msedge.exe'),
  path.join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe')
] : ['/usr/bin/chromium', '/usr/bin/chromium-browser'];
const executablePath = process.env.CHROMIUM_PATH || candidates.find(p => fs.existsSync(p));
module.exports = {headless:true, ...(executablePath ? {executablePath} : {}), args:['--no-sandbox']};
