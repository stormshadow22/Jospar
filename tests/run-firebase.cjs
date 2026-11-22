const {spawn}=require('node:child_process'),net=require('node:net'),path=require('node:path'),fs=require('node:fs');
async function port(){const server=net.createServer();await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));const value=server.address().port;await new Promise(resolve=>server.close(resolve));return value}
(async()=>{
 const env={...process.env};if(process.platform==='win32'){const temporary=process.env.JOSPAR_JAVA_TMPDIR||path.join(process.env.SystemRoot||'C:/Windows','Temp');if(fs.existsSync(temporary))env.JAVA_TOOL_OPTIONS=((env.JAVA_TOOL_OPTIONS||'')+' -Djdk.net.unixdomain.tmpdir="'+temporary+'"').trim()}
 const [firestore,auth,websocket,hub,logging]=await Promise.all(Array.from({length:5},port));env.JOSPAR_FIRESTORE_EMULATOR_PORT=String(firestore);
 fs.mkdirSync('.build',{recursive:true});const config=path.resolve('.build/firebase-emulators-'+process.pid+'.json');
 fs.writeFileSync(config,JSON.stringify({firestore:{rules:path.resolve('firestore.rules')},emulators:{firestore:{host:'127.0.0.1',port:firestore,websocketPort:websocket},auth:{host:'127.0.0.1',port:auth},hub:{host:'127.0.0.1',port:hub},logging:{host:'127.0.0.1',port:logging},ui:{enabled:false},singleProjectMode:true}}));
 const child=spawn(process.execPath,[require.resolve('firebase-tools/lib/bin/firebase.js'),'emulators:exec','--project','demo-jospar','--config',config,'--only','auth,firestore','node --test tests/firebase-rules.cjs'],{stdio:'inherit',env});child.on('exit',code=>{fs.unlinkSync(config);process.exitCode=code??1});child.on('error',e=>{console.error(e.message);process.exitCode=1});
})().catch(e=>{console.error(e);process.exitCode=1});
