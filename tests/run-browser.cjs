const {spawn}=require('node:child_process');
const {once}=require('node:events');
const app=require('../server/index');
(async()=>{const server=app.listen(0,'127.0.0.1');try{await once(server,'listening');const env={...process.env,JOSPAR_TEST_URL:'http://127.0.0.1:'+server.address().port};for(const name of (process.argv.length>2?process.argv.slice(2):['browser','features','design','reset','cloud-ui','coursework','reliability','navigation-notices','appearance','entrypoints'])){const child=spawn(process.execPath,['tests/'+name+'.cjs'],{stdio:'inherit',env});const [code]=await once(child,'exit');if(code!==0)throw Error(name+' failed with exit code '+code)}}finally{await new Promise(resolve=>server.close(resolve))}})().catch(e=>{console.error(e.message);process.exitCode=1});
