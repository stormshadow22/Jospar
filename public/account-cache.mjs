/** Remove only the signed-out account's private browser copies. Preferences and demo data remain. */
export function clearAccountCache(uid,local,session){
 if(typeof uid!=='string'||!uid)return true;
 let cleared=true;
 if(local===undefined)try{local=globalThis.localStorage}catch{cleared=false}
 if(session===undefined)try{session=globalThis.sessionStorage}catch{cleared=false}
 for(const prefix of ['jospar.backup.','jospar.data.','jospar.recent.','jospar.reminded.'])try{local.removeItem(prefix+uid)}catch{cleared=false}
 for(const key of ['jospar.pending','jospar.invite'])try{session.removeItem(key)}catch{cleared=false}
 return cleared;
}
