const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.JOSPAR_TEST_URL||'https://jospar-fcaa0-v3.web.app';
(async()=>{const browser=await chromium.launch(require('./browser-options.cjs'));try{
 const page=await browser.newPage();await page.goto(BASE+'/app.html',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.auth').waitFor({timeout:60000});
 const result=await page.evaluate(()=>Promise.race([import('/firebase-client.js').then(async sdk=>({sdk:sdk.firebaseSdkVersion,...await sdk.verifyAppCheck()})),new Promise((_,reject)=>setTimeout(()=>reject(Error('App Check timed out')),60000))]));
 assert.equal(result.sdk,require('../package.json').dependencies.firebase);assert.equal(result.active,true);assert.equal(result.valid,true);console.log('PASS real production App Check token accepted; bundled SDK '+result.sdk);
 }finally{await browser.close()}})().catch(error=>{console.error(error.message);process.exitCode=1});
