import {initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
export {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut,onAuthStateChanged,RecaptchaVerifier,signInWithPhoneNumber,updateProfile,verifyPasswordResetCode,confirmPasswordReset,deleteUser,getIdTokenResult} from 'firebase/auth';
export {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc,addDoc,query,where,orderBy,limit,onSnapshot,runTransaction,writeBatch,serverTimestamp,Timestamp,deleteField,arrayUnion} from 'firebase/firestore';
export {isSupported,getMessaging,getToken,deleteToken,onMessage} from 'firebase/messaging';
const app=initializeApp(window.JOSPAR_CONFIG),auth=getAuth(app),db=getFirestore(app);
if(window.JOSPAR_EMULATORS){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8086)}
export {app,auth,db};
