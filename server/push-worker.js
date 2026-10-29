/* Spark-compatible trusted worker. Run only on a server you control, with ADC.
   It never grants access: chat membership and invitations are enforced by Firestore rules. */
const {initializeApp,getApps}=require('firebase-admin/app');
const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
const {getMessaging}=require('firebase-admin/messaging');
const {getAuth}=require('firebase-admin/auth');
const invalidToken=code=>['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(code);
function pushPayload(note){return {data:{title:String(note.title).slice(0,100),body:String(note.body).slice(0,180),teamId:note.teamId,notificationId:note.id},webpush:{headers:{TTL:'86400',Urgency:'high'}}}}
async function startPushWorker(){
 if(!getApps().length)initializeApp({projectId:process.env.FIREBASE_PROJECT_ID||'jospar-fcaa0'});
 const db=getFirestore(),messaging=getMessaging(),adminAuth=getAuth();await db.collection('teams').limit(1).get();
 let stopped=false,active=new Set(),recentMessages=[],recentInvites=[];
 async function deliver(uid,note){if(stopped)return;const ref=db.doc(`users/${uid}/notifications/${note.id}`),now=Date.now();
 const claimed=await db.runTransaction(async tx=>{const old=await tx.get(ref),d=old.data();if(d&&['sent','no-devices'].includes(d.delivery))return false;if(d?.leaseUntil?.toMillis()>now)return false;const value={title:note.title,body:note.body,teamId:note.teamId,kind:note.kind,read:d?.read||false,delivery:'pending',leaseUntil:Timestamp.fromMillis(now+120000),createdAt:d?.createdAt||FieldValue.serverTimestamp()};tx.set(ref,value);return true});if(!claimed)return;
 try{const devices=await db.collection('pushDevices').where('uid','==',uid).where('enabled','==',true).limit(100).get();if(devices.empty){await ref.update({delivery:'no-devices',leaseUntil:Timestamp.fromMillis(0)});return}const valid=devices.docs.filter(d=>typeof d.data().token==='string'),tokens=valid.map(d=>d.data().token);if(!tokens.length){await ref.update({delivery:'no-devices'});return}
 const response=await messaging.sendEachForMulticast({...pushPayload(note),tokens});let retry=false;await Promise.all(response.responses.map(async(r,i)=>{if(!r.success){if(invalidToken(r.error?.code))await valid[i].ref.delete();else retry=true}}));await ref.update({delivery:retry?'pending':'sent',leaseUntil:Timestamp.fromMillis(retry?Date.now()+60000:0)});
 }catch(e){await ref.update({delivery:'pending',leaseUntil:Timestamp.fromMillis(Date.now()+60000)});console.error('Push delivery failed:',e.code||e.name)} }
 async function message(snap){const parts=snap.ref.path.split('/');if(parts.length!==4||parts[0]!=='teams')return;const m=snap.data(),teamSnap=await db.doc(`teams/${parts[1]}`).get();if(!teamSnap.exists)return;const team=teamSnap.data();if(!team.memberIds?.includes(m.senderId))return;const note={id:`chat_${parts[1]}_${snap.id}`,teamId:parts[1],title:team.name,body:'Новое сообщение команды в Jospar',kind:'chat'};for(const uid of team.memberIds.filter(uid=>uid!==m.senderId))await deliver(uid,note)}
 async function invitation(snap){const i=snap.data();if(!i.email||i.status!=='pending'||i.expiresAt?.toMillis()<Date.now())return;try{const u=await adminAuth.getUserByEmail(i.email);if(u.uid===i.createdBy)return;await deliver(u.uid,{id:'invite_'+snap.id,teamId:i.teamId,title:i.teamName,body:'Вас пригласили в команду Jospar',kind:'invite'})}catch(e){if(e.code!=='auth/user-not-found')throw e}}
 async function run(kind,snap){const key=kind+snap.id;if(active.has(key)||stopped)return;active.add(key);try{await (kind==='message'?message(snap):invitation(snap))}catch(e){console.error('Push worker request failed:',e.code||e.name)}finally{active.delete(key)}}
 const offMessages=db.collectionGroup('messages').orderBy('createdAt','desc').limit(100).onSnapshot(s=>{recentMessages=s.docs;s.docChanges().filter(c=>c.type==='added').forEach(c=>run('message',c.doc))},e=>console.error('Chat push listener failed:',e.code||e.name));
 const offInvites=db.collection('invitations').orderBy('createdAt','desc').limit(100).onSnapshot(s=>{recentInvites=s.docs;s.docChanges().filter(c=>c.type==='added').forEach(c=>run('invite',c.doc))},e=>console.error('Invitation push listener failed:',e.code||e.name));
 const timer=setInterval(()=>{recentMessages.forEach(d=>run('message',d));recentInvites.forEach(d=>run('invite',d))},60000);timer.unref();
 console.log('Firebase push worker connected to '+(process.env.FIREBASE_PROJECT_ID||'jospar-fcaa0'));
 return ()=>{stopped=true;clearInterval(timer);offMessages();offInvites()};
}
module.exports={startPushWorker,pushPayload,invalidToken};
