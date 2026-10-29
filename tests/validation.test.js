const {test}=require('node:test'),assert=require('node:assert/strict'),{validState}=require('../server/validation');
const base=()=>({tasks:[],projects:[],habits:[],goals:[],survey:{done:true,answers:{}}});
test('accept valid empty workspace',()=>assert.equal(validState(base()),true));
test('reject malformed arrays and survey',()=>{assert.equal(validState({...base(),tasks:{}}),false);assert.equal(validState({...base(),survey:{done:true,answers:{peak:99}}}),false)});
test('reject unsafe identifiers',()=>assert.equal(validState({...base(),projects:[{id:'"><script>',name:'x',c:'#ffffff'}]}),false));
test('reject invalid tasks',()=>assert.equal(validState({...base(),tasks:[{id:'t1',title:'x',due:'bad',pri:'high',done:false,tags:[]}]}),false));
test('accept multilingual task',()=>assert.equal(validState({...base(),tasks:[{id:'t1',title:'Сабақ оқу',desc:'',due:'2026-10-29',time:'10:30',pri:'high',done:false,tags:['оқу']}]}),true));
