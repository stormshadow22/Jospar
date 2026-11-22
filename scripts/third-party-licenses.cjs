const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),packages=new Map();
for(const file of ['firebase-client-meta.json','firebase-messaging-meta.json']){
 const meta=JSON.parse(fs.readFileSync(path.join(root,'.build',file),'utf8'));
 for(const input of Object.keys(meta.inputs)){
  if(!input.startsWith('node_modules/'))continue;
  let folder=path.dirname(path.join(root,input));
  while(folder.startsWith(path.join(root,'node_modules'))){
   const json=path.join(folder,'package.json');
   if(fs.existsSync(json)){const pkg=JSON.parse(fs.readFileSync(json,'utf8'));if(pkg.name&&pkg.version){packages.set(pkg.name,{...pkg,folder});break}}
   folder=path.dirname(folder);
  }
 }
}
let text='THIRD-PARTY NOTICES — Jospar browser bundles\n\nThese notices cover bundled third-party libraries, not a license grant for the original Jospar application.\n';
const firebase=fs.readFileSync(path.join(root,'public/licenses/firebase-js-sdk-LICENSE.txt'),'utf8');
for(const [name,pkg] of [...packages].sort(([a],[b])=>a.localeCompare(b))){
 const files=fs.readdirSync(pkg.folder).filter(file=>/^(licen[sc]e|copying|notice)([.-]|$)/i.test(file));
 let license=files.map(file=>fs.readFileSync(path.join(pkg.folder,file),'utf8')).join('\n\n');
 if(!license&&(name==='firebase'||name.startsWith('@firebase/')))license=firebase;
 if(!license)throw Error('Missing license text for bundled package '+name);
 text+='\n\n'+'='.repeat(72)+'\n'+name+' '+pkg.version+' — '+pkg.license+'\n'+'='.repeat(72)+'\n'+license;
}
fs.writeFileSync(path.join(root,'public/licenses/THIRD_PARTY_NOTICES.txt'),text);
fs.writeFileSync(path.join(root,'docs/BUNDLED_DEPENDENCIES.json'),JSON.stringify([...packages].map(([name,pkg])=>({name,version:pkg.version,license:pkg.license})),null,2)+'\n');
console.log('Third-party license texts included for '+packages.size+' bundled packages');
