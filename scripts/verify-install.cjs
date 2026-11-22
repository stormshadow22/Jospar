const fs=require('node:fs'),assert=require('node:assert/strict');
const manifest=require('../package.json'),lock=require('../package-lock.json');
assert.equal(lock.version,manifest.version,'Lock version mismatch');
assert.equal(lock.packages[''].version,manifest.version,'Root lock package version mismatch');
for(const name of ['firebase','firebase-tools']){
 const expected=manifest.dependencies?.[name]||manifest.devDependencies?.[name];
 const installed=require(name+'/package.json').version;
 assert.equal(installed,expected,'Run npm ci: installed '+name+' differs from package.json');
 assert.equal(lock.packages['node_modules/'+name].version,expected,'Lock entry differs: '+name);
}
console.log('Verified installed SDK and CLI match package.json and lock file');
