const {spawn}=require('node:child_process');
const path=require('node:path'),fs=require('node:fs');
const env={...process.env};
if(process.platform==='win32'){const temporary=process.env.JOSPAR_JAVA_TMPDIR||path.join(process.env.SystemRoot||'C:/Windows','Temp');if(fs.existsSync(temporary))env.JAVA_TOOL_OPTIONS=((env.JAVA_TOOL_OPTIONS||'')+' -Djdk.net.unixdomain.tmpdir="'+temporary+'"').trim()}
const child=spawn(process.execPath,[require.resolve('firebase-tools/lib/bin/firebase.js'),'emulators:exec','--project','demo-jospar','--only','auth,firestore','node --test tests/firebase-rules.cjs'],{stdio:'inherit',env});child.on('exit',code=>{process.exitCode=code??1});child.on('error',e=>{console.error(e.message);process.exitCode=1});
