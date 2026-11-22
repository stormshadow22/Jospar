const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validState}=require('../public/validation');
const base=()=>({tasks:[],projects:[],habits:[],goals:[],survey:{done:true,answers:{}}});
const task=()=>({id:'task1',title:'Read',desc:'',due:'2026-11-02',time:'10:30',done:false,pri:'mid',tags:[]});
test('reject non-string task fields before rendering and editing',()=>{
 for(const field of ['time','due','proj','doneAt']) {
  const d=base();d.tasks=[{...task(),[field]:['" autofocus onfocus="alert(1)']}];
  assert.equal(validState(d),false,field);
 }
});
test('malformed nested records return false instead of throwing',()=>{
 for(const field of ['tasks','projects','habits','goals','savedFilters','activity','teams']) {
  const d=base();d[field]=[null];assert.equal(validState(d),false,field);
 }
 assert.equal(validState({...base(),survey:{done:true,answers:[]}}),false);
 const cycle=base();cycle.extra=cycle;assert.equal(validState(cycle),false);
});
test('validate actual calendar dates and clock ranges',()=>{
 for(const [due,time] of [['2026-02-30','10:30'],['2026-13-01','10:30'],['2026-11-02','24:00'],['2026-11-02','12:99']])assert.equal(validState({...base(),tasks:[{...task(),due,time}]}),false);
 assert.equal(validState({...base(),tasks:[{...task(),due:'2028-02-29'}]}),true);
});
test('duplicate IDs and prototype keys cannot corrupt workspace state',()=>{
 assert.equal(validState({...base(),tasks:[task(),task()]}),false);
 const d=base();d.awards=JSON.parse('{"__proto__":{"polluted":true}}');assert.equal(validState(d),false);
});
test('server and browser use the same validation implementation',()=>assert.equal(require('../server/validation').validState,validState));
