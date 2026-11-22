import {initializeApp,SDK_VERSION} from 'firebase/app';
import {initializeAppCheck,ReCaptchaEnterpriseProvider,getToken as appCheckToken} from 'firebase/app-check';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
export {GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut,onAuthStateChanged,RecaptchaVerifier,signInWithPhoneNumber,updateProfile,verifyPasswordResetCode,confirmPasswordReset,deleteUser,getIdTokenResult} from 'firebase/auth';
export {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc,addDoc,query,where,orderBy,limit,onSnapshot,runTransaction,writeBatch,serverTimestamp,Timestamp,deleteField,arrayUnion,arrayRemove} from 'firebase/firestore';
export {isSupported,getMessaging,getToken,deleteToken,onMessage} from 'firebase/messaging';
const app=initializeApp(window.JOSPAR_CONFIG);
let appCheck=null;
const protection=window.JOSPAR_APP_CHECK;
if(protection?.enabled&&!window.JOSPAR_EMULATORS&&!['localhost','127.0.0.1'].includes(location.hostname)){appCheck=initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(protection.siteKey),isTokenAutoRefreshEnabled:true})}
const auth=getAuth(app),db=getFirestore(app);
export const firebaseSdkVersion=SDK_VERSION;
export async function verifyAppCheck(){if(!appCheck)return {active:false};const result=await appCheckToken(appCheck);return {active:true,valid:!!result.token}};
if(window.JOSPAR_EMULATORS){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8086)}
export {app,auth,db};
