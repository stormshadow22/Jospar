const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const BASE=process.env.JOSPAR_TEST_URL||'http://127.0.0.1:8089';
(async()=>{const browser=await chromium.launch(require('./browser-options.cjs'));try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));const dir=path.join(require('node:os').tmpdir(),'jospar-appearance');fs.mkdirSync(dir,{recursive:true});
 await p.goto(BASE+'/demo.html',{waitUntil:'domcontentloaded',timeout:60000});await p.locator('.welcome').waitFor();await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('html').getAttribute('data-look'),'campus');assert.ok(await p.locator('.back-row').isHidden());
 const initial=await p.evaluate(()=>JSON.parse(localStorage.getItem('jospar.data.coursework-demo')));
 const settings=async()=>{await p.locator('[data-p=av]').click();await p.locator('#popav [data-act=settings]').click();await p.locator('.appearance-options').waitFor()};
 for(const look of ['campus','notebook','horizon']){
  await settings();await p.locator('[data-act=appearance][data-look='+look+']').click();
  assert.equal(await p.locator('[data-act=appearance][aria-pressed=true]').count(),1);await p.screenshot({path:path.join(dir,'picker-'+look+'.png'),fullPage:true,animations:"disabled"});
  assert.equal(await p.evaluate(()=>localStorage.getItem('jospar.look')),look);await p.keyboard.press('Escape');
  await p.reload({waitUntil:'domcontentloaded',timeout:60000});await p.locator('.welcome').waitFor();assert.equal(await p.locator('html').getAttribute('data-look'),look);
  await p.evaluate(()=>document.fonts.ready);
  for(const mode of ['light','dark']){
   await p.locator('[data-p=th]').click();await p.locator('[data-act=theme][data-th='+mode+']').click();
   for(const width of [1440,768,390,320]){
    await p.setViewportSize({width,height:1000});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+look+'/'+mode+'/'+width);
    assert.ok(await p.locator('.back-row').isHidden());
    if(width===1440||width===390)await p.screenshot({path:path.join(dir,look+'-'+mode+'-'+width+'.png'),fullPage:true,animations:"disabled"});
   }
   await settings();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('[data-act=appearance][data-look='+look+']').focus();assert.ok(await p.locator('[data-act=appearance][data-look='+look+']').evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=2));await p.keyboard.press('Escape');
   await p.setViewportSize({width:1440,height:1000});await p.locator('#side [data-v=calendar]').click();assert.ok(await p.locator('.back-row').isVisible());
   const bounds=await p.evaluate(()=>({back:document.querySelector('.page-back').getBoundingClientRect().left,body:document.querySelector('#body').getBoundingClientRect().left}));assert.ok(Math.abs(bounds.back-bounds.body)<=1,'back alignment '+look+'/'+mode);
   await p.locator('[data-act=pageBack]').click();await p.locator('.welcome').waitFor();assert.ok(await p.locator('.back-row').isHidden());
  }
 }
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('jospar.data.coursework-demo'))),initial,'appearance must not mutate plans');
 // Storage failure changes only the appearance for this session, with an explicit status.
 await settings();await p.evaluate(()=>{window.savedSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='jospar.look')throw new DOMException('Quota','QuotaExceededError');return window.savedSet.call(this,k,v)}});
 await p.locator('[data-act=appearance][data-look=campus]').click();assert.match(await p.locator('#appearanceStatus').innerText(),/сеанс/);await p.evaluate(()=>{Storage.prototype.setItem=window.savedSet});await p.keyboard.press('Escape');
 await p.evaluate(()=>localStorage.setItem('jospar.look','__proto__'));await p.reload({waitUntil:'domcontentloaded',timeout:60000});await p.locator('.welcome').waitFor();assert.equal(await p.locator('html').getAttribute('data-look'),'campus');
 await p.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:20000});await p.evaluate(()=>navigator.serviceWorker.ready);await context.setOffline(true);await p.reload({waitUntil:'domcontentloaded',timeout:60000});await p.locator('.welcome').waitFor();
 for(const look of ['notebook','horizon','campus']){await settings();await p.locator('[data-act=appearance][data-look='+look+']').click();assert.ok(await p.locator('[data-look='+look+'] img').first().evaluate(e=>e.complete&&e.naturalWidth>0));await p.keyboard.press('Escape')}
 await context.setOffline(false);const other=await context.newPage();await other.goto(BASE+'/demo.html',{waitUntil:'domcontentloaded',timeout:60000});await other.locator('.welcome').waitFor();await other.evaluate(()=>JosparAppearance.apply('horizon'));await p.waitForFunction(()=>document.documentElement.dataset.look==='horizon');await other.close();
 assert.deepEqual(errors,[]);console.log('PASS three themes, local persistence, unchanged planner data, 24 responsive theme/mode/width combinations, visible focus, aligned back, home back hidden, storage failure/fallback, offline switching and tab sync. Screenshots: '+dir);
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
