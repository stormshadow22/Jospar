const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const BASE=process.env.JOSPAR_TEST_URL||'http://127.0.0.1:8089';
(async()=>{const browser=await chromium.launch(require('./browser-options.cjs'));try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/firebase-client.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'fixtures/firebase-mock.js'),'utf8')}));
 await p.exposeBinding('testFirestore',(_,a)=>{if(a.op==='get'&&a.path==='publicProfiles/alice')return {username:'alice',displayName:'Alice',avatarURL:'',bio:''};if(a.op==='get'&&a.path==='users/alice')return {version:0,data:{tasks:[],projects:[],habits:[],goals:[],survey:{done:true,answers:{}}}};if(a.op==='query')return [];return null});
 await p.goto(BASE+'/app.html');await p.locator('.welcome').waitFor();
 await p.evaluate(()=>{for(const prefix of ['jospar.backup.','jospar.data.','jospar.recent.','jospar.reminded.']){localStorage.setItem(prefix+'alice','private');localStorage.setItem(prefix+'bob','other')}localStorage.setItem('jospar.look','horizon');localStorage.setItem('jospar.data.coursework-demo','demo');sessionStorage.setItem('jospar.pending','email')});
 await p.locator('[data-p=av]').click();await p.locator('#popav [data-act=logout]').click();await p.locator('[data-act=submitLogin]').waitFor();
 assert.deepEqual(await p.evaluate(()=>({leaks:Object.keys(localStorage).filter(k=>k.endsWith('.alice')),other:localStorage.getItem('jospar.backup.bob'),theme:localStorage.getItem('jospar.look'),demo:localStorage.getItem('jospar.data.coursework-demo'),pending:sessionStorage.getItem('jospar.pending')})),{leaks:[],other:'other',theme:'horizon',demo:'demo',pending:null});
 await p.locator('.auth-privacy a').click();await p.locator('h1').waitFor();assert.match(await p.locator('h1').innerText(),/Конфиденциальность/);assert.equal(await p.locator('a[href="mailto:m.shifu2009@gmail.com"]').count(),1);assert.equal(await p.locator('a[href="/licenses/THIRD_PARTY_NOTICES.txt"]').count(),1);assert.deepEqual(errors,[]);
 console.log('PASS cloud sign-out removes account caches, keeps theme/other accounts/demo, clears pending email and links to actual privacy notice');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
