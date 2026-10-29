/* Browser UI fixture only. No Firebase rules/authentication semantics are emulated here. */
export const app={},db={};
const uid=window.TEST_UID||'alice';
const currentUser={uid,email:uid+'@example.com',emailVerified:true,phoneNumber:null,authTime:Date.now()/1000,async reload(){},async getIdToken(){return 'test-token'}};
export const auth={currentUser,authStateReady:async()=>{}};
const api=(op,args)=>window.testFirestore({op,...args});
const revive=x=>{if(x&&typeof x==='object'){if(x.__stamp!==undefined)return {toMillis:()=>x.__stamp,toDate:()=>new Date(x.__stamp),__stamp:x.__stamp};if(Array.isArray(x))return x.map(revive);return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,revive(v)]))}return x};
export const doc=(base,...p)=>({path:[base.path,...p].filter(Boolean).join('/')});
export const collection=doc;
export const where=(field,op,value)=>({field,op,value});
export const orderBy=(field,direction)=>({order:field,direction});
export const limit=n=>({limit:n});
export const query=(ref,...conditions)=>({...ref,conditions});
const snapshot=(path,data)=>({ref:{path},id:path.split('/').at(-1),exists:()=>data!==null,data:()=>revive(data)});
export async function getDoc(ref){return snapshot(ref.path,await api('get',{path:ref.path}))}
export async function getDocs(ref){const values=await api('query',{ref});return {docs:values.map(x=>snapshot(x.path,x.data)),empty:!values.length}}
export const setDoc=(ref,data)=>api('set',{path:ref.path,data});
export const updateDoc=(ref,data)=>api('update',{path:ref.path,data});
export const deleteDoc=ref=>api('delete',{path:ref.path});
export async function addDoc(ref,data){const path=await api('add',{path:ref.path,data});return {path,id:path.split('/').at(-1)}}
export const serverTimestamp=()=>({__now:true});
export const Timestamp={fromMillis:ms=>({__stamp:ms})};
export const arrayUnion=(...values)=>({__union:values});
export function writeBatch(){const ops=[];return {set:(ref,data)=>ops.push({op:'set',path:ref.path,data}),update:(ref,data)=>ops.push({op:'update',path:ref.path,data}),delete:ref=>ops.push({op:'delete',path:ref.path}),commit:()=>api('batch',{ops})}}
export async function runTransaction(_,fn){const batch=writeBatch();const out=await fn({get:getDoc,...batch});await batch.commit();return out}
export function onSnapshot(ref,next,error){let stopped=false,previous='',polling=false;async function poll(){if(polling)return;polling=true;try{const data=await api(ref.conditions?'query':'get',ref.conditions?{ref}:{path:ref.path});const raw=JSON.stringify(data);if(raw!==previous&&!stopped){previous=raw;next(ref.conditions?{docs:data.map(x=>snapshot(x.path,x.data))}:snapshot(ref.path,data))}}catch(e){error?.(e)}finally{polling=false}}poll();const timer=setInterval(poll,60);return ()=>{stopped=true;clearInterval(timer)}}
export const isSupported=async()=>false;
export const getMessaging=()=>({});
export const getToken=async()=> 'test-token';
export const deleteToken=async()=>true;
export const onMessage=()=>()=>{};
export async function signOut(){auth.currentUser=null}
export const onAuthStateChanged=(_,fn)=>{setTimeout(()=>fn(auth.currentUser));return ()=>{}};
export const updateProfile=async(u,p)=>Object.assign(u,p);
export const sendPasswordResetEmail=async()=>{};
export const sendEmailVerification=async()=>{};
export const createUserWithEmailAndPassword=async()=>({user:currentUser});
export const signInWithEmailAndPassword=createUserWithEmailAndPassword;
export const signInWithPhoneNumber=async()=>({confirm:async()=>({user:currentUser})});
export const RecaptchaVerifier=class {};
export const verifyPasswordResetCode=async()=>currentUser.email;
export const confirmPasswordReset=async()=>{};
export const deleteUser=async()=>{};
export const getIdTokenResult=async()=>({claims:{auth_time:Date.now()/1000}});
export const deleteField=()=>null;
