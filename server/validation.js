function validState(d){
 if(!d||typeof d!=='object'||Array.isArray(d)||new TextEncoder().encode(JSON.stringify(d)).length>650000)return false;
 if(!['tasks','projects','habits','goals'].every(k=>Array.isArray(d[k])&&d[k].length<=3000)||!d.survey||typeof d.survey.done!=='boolean')return false;
 if(!d.survey.answers||typeof d.survey.answers!=='object')return false;for(const [k,v] of Object.entries(d.survey.answers)){if(k==='areas'){if(!Array.isArray(v)||!v.every(n=>Number.isInteger(n)&&n>=0&&n<6))return false}else if(!Number.isInteger(v)||v<0||v>5)return false;}
 const id=x=>x&&typeof x.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x.id),text=(x,n)=>typeof x==='string'&&x.length<=n;
 const color=c=>/^#[0-9a-f]{6}$/i.test(c),date=x=>x===''||/^\d{4}-\d{2}-\d{2}$/.test(x);
 return d.tasks.every(x=>id(x)&&text(x.title,140)&&text(x.desc||'',500)&&date(x.due)&&['low','mid','high'].includes(x.pri)&&typeof x.done==='boolean'&&(!x.time||/^\d{2}:\d{2}$/.test(x.time))&&Array.isArray(x.tags)&&x.tags.every(t=>/^[\p{L}\p{N}_-]{1,60}$/u.test(t)))&&d.projects.every(x=>id(x)&&text(x.name,30)&&color(x.c))&&d.habits.every(x=>id(x)&&text(x.name,24)&&color(x.c)&&Number.isInteger(x.target)&&x.target>=1&&x.target<=20&&x.log&&Object.entries(x.log).every(([k,v])=>date(k)&&Number.isInteger(v)&&v>=0&&v<=20))&&d.goals.every(x=>id(x)&&text(x.title,60)&&Number.isFinite(x.pct)&&x.pct>=0&&x.pct<=100);
}
if(typeof module!=='undefined')module.exports={validState};else window.validState=validState;
