const {test}=require('node:test'),assert=require('node:assert/strict'),app=require('../server/index');
test('local server serves workspace and explicitly rejects cloud API',async()=>{const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));try{const base='http://127.0.0.1:'+server.address().port;let r=await fetch(base+'/api/health');assert.deepEqual(await r.json(),{ok:true,mode:'local'});r=await fetch(base+'/');assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.match(await r.text(),/app.js/);r=await fetch(base+'/api/state');assert.equal(r.status,503);assert.equal((await r.json()).code,'eConfiguration');r=await fetch(base+'/app.js');assert.match(r.headers.get('content-type'),/javascript/);assert.equal(r.headers.get('x-frame-options'),'DENY');}finally{await new Promise(resolve=>server.close(resolve))}});

test('missing script returns 404 rather than HTML and scripts revalidate',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const base='http://127.0.0.1:'+server.address().port;assert.equal((await fetch(base+'/missing.js')).status,404);assert.equal((await fetch(base+'/app.html')).headers.get('cache-control'),'no-store');assert.equal((await fetch(base+'/app.js')).headers.get('cache-control'),'no-cache')}
 finally{await new Promise(r=>server.close(r))}
});
