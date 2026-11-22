/* In-site notifications only: no browser permission or background delivery. */
(function(global){
 'use strict';
 function due(tasks,now,since){
  return tasks.filter(function(task){
   if(task.done||!/^\d{4}-\d{2}-\d{2}$/.test(task.due)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(task.time))return false;
   var at=new Date(task.due+'T'+task.time+':00').getTime();
   return at<=now&&at>since;
  });
 }
 function create(options){
  var host=document.createElement('div'),cards=new Map(),seen=new Set(),pending=[];
  host.className='notice-stack';host.setAttribute('aria-label',options.label);document.body.appendChild(host);
  function drain(){if(options.enabled&&!options.enabled()){pending=[];return}while(pending.length&&cards.size<3)display(pending.shift())}
  function remove(card,immediate){
   if(card.removing)return;card.removing=true;
   clearTimeout(card.timer);cards.delete(card.key);
   if(immediate){card.node.remove();return}
   card.node.classList.add('notice-leaving');setTimeout(function(){card.node.remove();drain()},320);
  }
  function show(item){
   if(options.enabled&&!options.enabled()||seen.has(item.key))return;
   seen.add(item.key);if(seen.size>1000)seen.delete(seen.values().next().value);
   if(cards.size>=3){if(pending.length>=50)pending.shift();pending.push(item);return}
   display(item);
  }
  function display(item){
   var node=document.createElement('article');node.className='site-notice';node.dataset.noticeKey=item.key;
   var content=document.createElement('button');content.type='button';content.className='notice-content';
   var text=document.createElement('span');text.setAttribute('role','status');
   var title=document.createElement('strong');title.textContent=item.title;
   var body=document.createElement('span');body.className='notice-body';body.textContent=item.body;
   text.append(title,body);content.appendChild(text);
   var close=document.createElement('button');close.type='button';close.className='notice-close';close.textContent='×';close.setAttribute('aria-label',options.closeLabel);
   var card={node:node,key:item.key,timer:null};cards.set(item.key,card);
   close.onclick=function(){remove(card)};
   content.onclick=function(){if(options.beforeOpen&&options.beforeOpen()===false)return;remove(card);if(item.open)item.open()};
   node.append(content,close);host.appendChild(node);
   card.timer=setTimeout(function(){remove(card)},10000);
  }
  return {show:show,clear:function(){pending=[];cards.forEach(function(card){remove(card,true)});host.replaceChildren();seen.clear()}};
 }
 var api={due:due,create:create};global.JosparNotices=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
