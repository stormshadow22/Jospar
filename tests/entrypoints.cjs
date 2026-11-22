const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const BASE=process.env.JOSPAR_TEST_URL||'http://127.0.0.1:8089';
(async()=>{const browser=await chromium.launch(require('./browser-options.cjs'));try{
 const context=await browser.newContext({colorScheme:'light'}),p=await context.newPage(),errors=[];let staleRootHits=0;
 p.on('pageerror',error=>errors.push(error.message));
 await context.addInitScript(()=>{window.TEST_SIGNED_OUT=true;localStorage.setItem('jospar.look','horizon')});
 await context.exposeBinding('testFirestore',()=>null);
 await p.route('**/firebase-client.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'fixtures/firebase-mock.js'),'utf8')}));
 // Simulate the old root page still held by a user's browser. Neither exit may request it.
 await p.route(BASE+'/',route=>{staleRootHits++;return route.fulfill({contentType:'text/html',body:'<h1>OLD ROOT</h1>'})});
 await p.goto(BASE+'/demo.html',{waitUntil:'domcontentloaded'});await p.locator('.welcome').waitFor();
 assert.equal(await p.locator('.demo-banner a').getAttribute('href'),'/app.html');
 await p.locator('.demo-banner a').click();await p.waitForURL('**/app.html');await p.locator('[data-act=googleLogin]').waitFor();
 assert.equal(await p.evaluate(()=>!!window.JOSPAR_DEMO),false);assert.equal(await p.locator('html').getAttribute('data-look'),'horizon');
 await p.locator('.demo-entry').click();await p.locator('.welcome').waitFor();await p.locator('[data-p=av]').click();await p.locator('#popav [data-act=logout]').click();await p.waitForURL('**/app.html');await p.locator('[data-act=googleLogin]').waitFor();
 assert.equal(staleRootHits,0);assert.equal(await p.locator('html').getAttribute('data-look'),'horizon');assert.deepEqual(errors,[]);
 console.log('PASS demo cloud link and logout open /app.html, bypass stale root and preserve chosen appearance; cloud auth UI uses mocked signed-out SDK');
 }finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
