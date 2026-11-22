const {test}=require('node:test');
const assert=require('node:assert/strict');
const {due}=require('../public/notices.js');
test('Reminders: local due time, completed/untimed/future excluded, catch up after sleep',()=>{
 const now=new Date('2026-11-19T15:30:05').getTime();
 const task={id:'a',due:'2026-11-19',time:'15:30',done:false};
 const tasks=[task,{...task,id:'old',time:'14:00'},{...task,id:'future',time:'15:31'},{...task,id:'done',done:true},{...task,id:'untimed',time:''},{...task,id:'invalid',time:'25:00'}];
 assert.deepEqual(due(tasks,now,now-60000).map(t=>t.id),['a']);
 assert.deepEqual(due(tasks,now,now-7200000).map(t=>t.id),['a','old']);
 assert.deepEqual(due(tasks,now,now),[]);
});
