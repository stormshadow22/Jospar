const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.JOSPAR_TEST_URL||'http://127.0.0.1:8089';
(async()=>{const browser=await chromium.launch(require('./browser-options.cjs'));try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install({time:new Date('2026-11-19T12:00:05')});
 await p.addInitScript(()=>{localStorage.setItem('jospar.lang','ru');window.permissionCalls=0;Notification.requestPermission=()=>{window.permissionCalls++;return Promise.resolve('denied')}});
 await p.goto(BASE+'/demo.html');await p.locator('.welcome').waitFor();
 assert.ok(await p.locator('[data-act=pageBack]').isHidden());
 await p.locator('#side [data-v=calendar]').click();await p.locator('#side [data-v=projects]').click();
 await p.locator('[data-act=pageBack]').click();assert.equal(await p.locator('#side [data-v=calendar]').getAttribute('aria-current'),'page');
 await p.locator('[data-act=pageBack]').click();await p.locator('.welcome').waitFor();assert.ok(await p.locator('[data-act=pageBack]').isHidden());
 await p.locator('#gq').fill('Подготовить');await p.locator('[data-act=pageBack]').click();await p.locator('.welcome').waitFor();assert.equal(await p.locator('#gq').inputValue(),'');
 // Schedule a real task through its editor, with browser permission deliberately unavailable.
 await p.locator('#side [data-act=newTask]').click();await p.locator('#mT').fill('Напоминание на защиту');
 await p.locator('#mDue').fill('2026-11-19');await p.locator('#mTm').fill('12:01');await p.locator('[data-act=saveTask]').click();
 await p.clock.fastForward(55000);await p.locator('.site-notice').filter({hasText:'Напоминание на защиту'}).waitFor();
 assert.equal(await p.evaluate(()=>window.permissionCalls),0);
 await p.clock.fastForward(9000);assert.equal(await p.locator('.site-notice:not(.notice-leaving)').count(),1);
 await p.clock.fastForward(1000);assert.equal(await p.locator('.site-notice.notice-leaving').count(),1);
 await p.clock.fastForward(400);assert.equal(await p.locator('.site-notice').count(),0);
 await p.reload();await p.locator('.welcome').waitFor();await p.clock.fastForward(1000);assert.equal(await p.locator('.site-notice').count(),0,'reload must not repeat a reminder');
 // Notification actions protect an unsaved form, then open the scheduled task.
 await p.locator('#side [data-act=newTask]').click();await p.locator('#mT').fill('Задача для открытия');await p.locator('#mDue').fill('2026-11-19');await p.locator('#mTm').fill('12:02');await p.locator('[data-act=saveTask]').click();
 await p.locator('#side [data-act=newTask]').click();await p.locator('#mT').fill('Несохранённая форма');
 await p.clock.fastForward(50000);await p.locator('.site-notice .notice-content').click();assert.equal(await p.locator('#mT').inputValue(),'Несохранённая форма');
 await p.keyboard.press('Escape');await p.locator('.site-notice .notice-content').click();assert.equal(await p.locator('#mT').inputValue(),'Задача для открытия');await p.keyboard.press('Escape');await p.clock.fastForward(400);
 // Card behavior, safe text, deduplication, maximum stack size, close and mobile containment.
 await p.evaluate(()=>{window.noticeTest=JosparNotices.create({label:'test',closeLabel:'Закрыть'});for(let i=0;i<4;i++)noticeTest.show({key:'test'+i,title:'Команда',body:'<img src=x onerror=alert(1)> '+i,open:()=>window.noticeOpened=true});noticeTest.show({key:'test3',title:'Duplicate',body:'duplicate'})});
 assert.equal(await p.locator('.site-notice').count(),3);assert.equal(await p.locator('.site-notice img').count(),0);
 await p.locator('.notice-content').first().click();assert.equal(await p.evaluate(()=>window.noticeOpened),true);await p.clock.fastForward(400);
 await p.locator('.notice-close').first().click();await p.clock.fastForward(400);assert.equal(await p.locator('.site-notice').count(),2);assert.ok((await p.locator('.site-notice').allTextContents()).some(text=>text.includes('3')),'queued card is delivered');
 await p.setViewportSize({width:320,height:720});assert.ok(await p.locator('.site-notice').first().evaluate(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth}));
 await p.emulateMedia({reducedMotion:'reduce'});assert.ok(await p.locator('.site-notice').first().evaluate(e=>parseFloat(getComputedStyle(e).animationDuration)<=0.01));await p.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'jospar-notice-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS back history, search return, real task reminders without browser permission, 10-second animated dismissal, reload deduplication, safe clickable cards, close, stack limit, mobile and reduced motion');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

