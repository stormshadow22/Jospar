const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const sandbox={window:{},Date,Set,URL,Blob};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../public/features.js'),'utf8'),sandbox);
function fixture(){const data={tasks:[{id:'t1',title:'Курсовая',desc:'Доклад',proj:'p1',tags:['учеба'],due:'2026-10-29',pri:'high',done:false},{id:'t2',title:'Покупки',desc:'',proj:'',tags:[],due:'2026-10-30',pri:'low',done:false},{id:'t3',title:'Архив',desc:'',proj:'p1',tags:['учеба'],due:'',pri:'mid',done:true}],projects:[{id:'p1',name:'Университет'}]};let i=0;const f=sandbox.window.JosparFeatures.create({state:()=>({data}),tr:(en,ru)=>ru,t:x=>x,today:()=> '2026-10-29',day:n=>n===1?'2026-10-30':'2026-10-29',projectName:p=>p.name,uid:()=> 'n'+(++i),dueTasks:()=>[],locale:()=> 'ru-RU'});return {data,f}}
test('query combines date, priority and tag',()=>{const {f}=fixture();assert.equal(f.searchTasks('сегодня p1 @учеба').length,1);assert.equal(f.searchTasks('сегодня p3').length,0);assert.equal(f.searchTasks('tomorrow p3')[0].id,'t2')});
test('query searches projects and completion independently',()=>{const {f}=fixture();assert.equal(f.searchTasks('#университет active').length,1);assert.equal(f.searchTasks('done @учеба')[0].id,'t3');assert.equal(f.searchTasks('nodate').length,0)});
test('new activity creates unread notification',()=>{const {f,data}=fixture();f.record('created',data.tasks[0]);assert.equal(f.unreadCount(),1);data.notificationRead.n1=true;assert.equal(f.unreadCount(),0)});
test('notification history is bounded',()=>{const {f,data}=fixture();for(let i=0;i<210;i++)f.record('updated',data.tasks[0]);assert.equal(data.activity.length,200)});

test('CSV neutralizes formulas after whitespace and quotes multiline cells',async()=>{
 let exported;
 const context={window:{},Date,Set,Blob,URL:{createObjectURL:b=>{exported=b;return 'blob:test'},revokeObjectURL(){}},document:{createElement:()=>({click(){}})},setTimeout(){}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../public/features.js'),'utf8'),context);
 const titles=['=1+1','  =1+1','\n=1+1','\t@SUM(1,1)','safe "title"'];
 const data={tasks:titles.map(title=>({title,proj:'',due:'',pri:'mid',done:false})),projects:[]};
 const f=context.window.JosparFeatures.create({state:()=>({data})});f.handle('fxCsv',{});
 const csv=await exported.text();
 for(const title of titles.slice(0,4))assert.ok(csv.includes('"\''+title.replace(/"/g,'""')+'"'),title);
 assert.ok(csv.includes('"safe ""title"""'));
});
