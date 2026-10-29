// Боевой бэкенд: Firebase Authentication (почта + SMS) + ваш API (/api) с Firestore.
// Подключается автоматически, когда в index.html заполнен window.FIREBASE_CONFIG.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut,onAuthStateChanged,RecaptchaVerifier,signInWithPhoneNumber} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(initializeApp(window.FIREBASE_CONFIG));
let pend = JSON.parse(sessionStorage.getItem('jospar.pending')||'null'), conf = null, verifier = null, cache = null;
const err = c => ({code: c});
const known = new Set(["eExists","eCode","eNoAcc","eWrong","eVerify","eNet","eTaken"]);

async function api(path, opt = {}) {
  const tok = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const r = await fetch("/api" + path, {...opt, headers: {"Content-Type": "application/json", Authorization: "Bearer " + tok}});
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw err(j.code || "eNet"); }
  return r.json();
}
const rec = () => verifier || (verifier = new RecaptchaVerifier(auth, "recaptcha", {size: "invisible"}));
function map(e) {
  if (e && known.has(e.code)) return e;
  const c = (e && e.code) || "";
  if (c.includes("email-already") || c.includes("account-exists")) return err("eExists");
  if (c.includes("wrong-password") || c.includes("invalid-credential")) return err("eWrong");
  if (c.includes("user-not-found")) return err("eNoAcc");
  if (c.includes("invalid-verification-code") || c.includes("code-expired")) return err("eCode");
  return err("eNet");
}
const waitAuth = () => new Promise(res => { const off = onAuthStateChanged(auth, u => { off(); res(u); }); });

export default {
  demo: false,
  async remove(){await api("/account",{method:"DELETE"});return signOut(auth)},
  reset(email){return sendPasswordResetEmail(auth,email)},
  async free(u) { const r = await fetch("/api/username-available?u=" + encodeURIComponent(u)); return (await r.json()).free; },
  async register(p) {
    pend = p;sessionStorage.setItem('jospar.pending',JSON.stringify({username:p.username,method:p.method,contact:p.contact}));
    try {
      if (p.method === "email") {
        const c = await createUserWithEmailAndPassword(auth, p.contact, p.password);
        await sendEmailVerification(c.user);
        return {mode: "link"};
      }
      conf = await signInWithPhoneNumber(auth, p.contact, rec());
      return {mode: "code"};
    } catch (e) { throw map(e); }
  },
  async resend() {
    try {
      if (pend.method === "email") await sendEmailVerification(auth.currentUser);
      else conf = await signInWithPhoneNumber(auth, pend.contact, rec());
      return {};
    } catch (e) { throw map(e); }
  },
  async confirm(code) {
    try {
      if (pend.method === "email") { await auth.currentUser.reload();await auth.currentUser.getIdToken(true); if (!auth.currentUser.emailVerified) throw err("eVerify"); }
      else await conf.confirm(code);
      await api("/profile", {method: "POST", body: JSON.stringify({username: pend.username})});
      cache = null;
      return await this.current();
    } catch (e) { throw map(e); }
  },
  async loginStart(c) { try { conf = await signInWithPhoneNumber(auth, c, rec()); return {}; } catch (e) { throw map(e); } },
  async login(o) {
    try {
      if (o.method === "email") {
        const c = await signInWithEmailAndPassword(auth, o.contact, o.password);
        if (!c.user.emailVerified){await sendEmailVerification(c.user);throw err("eVerify");}
      } else await conf.confirm(o.code);
      cache = null;
      return await this.current();
    } catch (e) { throw map(e); }
  },
  async current() {
    const u = auth.currentUser || await waitAuth();
    if (!u) return null;
    try { cache = await api("/state"); } catch (e) { return null; }
    if(!cache.profile){let username=pend&&pend.username;if(!username)username=prompt('Завершение регистрации: введите имя пользователя (3–20 символов)');if(!username)throw err('eUser');await api('/profile',{method:'POST',body:JSON.stringify({username})});cache=await api('/state');sessionStorage.removeItem('jospar.pending')}
    const p = cache.profile;
    return p ? {id: u.uid, username: p.username, method: p.method, contact: p.contact} : null;
  },
  logout() { cache = null; return signOut(auth); },
  async load() { if (!cache) cache = await api("/state"); return cache.data; },
  async save(u, d) {if(!auth.currentUser||auth.currentUser.uid!==u.id)throw err("eAuth");const r=await api("/state", {method:"PUT",body:JSON.stringify({data:d,version:cache.version||0})});cache.version=r.version;cache.data=d;return r;}
};
