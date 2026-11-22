/* Appearance is a device preference, independent of account and planner data. */
(function(){
 'use strict';
 var allowed=['campus','notebook','horizon'],key='jospar.look',selected='campus';
 function valid(value){return allowed.indexOf(value)!==-1}
 try{var stored=localStorage.getItem(key);if(valid(stored))selected=stored}catch{}
 function apply(value,persist){
  if(!valid(value))return false;
  selected=value;document.documentElement.setAttribute('data-look',value);window.dispatchEvent(new Event('jospar:appearance'));
  if(persist!==false)try{localStorage.setItem(key,value)}catch{return false}
  return true;
 }
 apply(selected,false);
 try{var mode=localStorage.getItem('jospar.pref');if(mode!=='light'&&mode!=='dark')mode=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.setAttribute('data-t',mode)}catch{}
 var preload=document.createElement('link');preload.rel='preload';preload.as='image';preload.href='/assets/themes/'+selected+'.jpg';document.head.appendChild(preload);
 window.JosparAppearance={current:function(){return selected},apply:apply};
 window.addEventListener('storage',function(event){if(event.key===key)apply(valid(event.newValue)?event.newValue:'campus',false)});
})();
