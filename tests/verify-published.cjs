const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
(async()=>{
 const version=JSON.parse(fs.readFileSync('public/version.json','utf8')).version;
 const base=process.env.JOSPAR_TEST_URL||'https://jospar-fcaa0-v3.web.app';
 const files=['index.html','app.html','demo.html','app.js','appearance.js','appearance.css','fonts.css','demo-sw.js','version.json','assets/themes/campus.jpg','assets/themes/notebook.jpg','assets/themes/horizon.jpg'];
 async function check(file){
  let last;
  for(let attempt=0;attempt<3;attempt++)try{
   const response=await fetch(base+'/'+file+'?verify='+version,{signal:AbortSignal.timeout(20000)});
   assert.equal(response.status,200);const remote=Buffer.from(await response.arrayBuffer());
   assert.ok(remote.equals(fs.readFileSync('public/'+file)),'Published mismatch: '+file);
   return {file,sha256:crypto.createHash('sha256').update(remote).digest('hex')};
  }catch(error){last=error}
  throw last;
 }
 for(const path of ['/','/app.html']){const response=await fetch(base+path,{signal:AbortSignal.timeout(20000)});assert.match(response.headers.get('cache-control')||'',/no-store/,'Cache policy '+path)}
 const checks=[];
 for(let index=0;index<files.length;index+=4)checks.push(...await Promise.all(files.slice(index,index+4).map(check)));
 fs.writeFileSync('docs/PUBLISHED_'+version.replaceAll('.','_')+'_CHECKS.json',JSON.stringify({version,url:base,verifiedAt:new Date().toISOString(),files:checks},null,2)+'\n');
 console.log('PASS live version '+version+' matches local release ('+checks.length+' files)');
})().catch(error=>{console.error(error);process.exitCode=1});
