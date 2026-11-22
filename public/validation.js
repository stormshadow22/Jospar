/* Shared by browser and Node; imports and cloud data are untrusted. */
function validState(d) {
 try {
  const map = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const text = (x, max) => typeof x === 'string' && x.length <= max;
  const identifier = x => typeof x === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(x);
  const id = x => map(x) && identifier(x.id);
  const ref = x => x === undefined || x === '' || identifier(x);
  const token = x => x === undefined || (text(x,80) && /^[a-zA-Z0-9_-]*$/.test(x));
  const color = x => typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x);
  const date = x => {
   if (x === '') return true;
   if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
   const parsed = new Date(x + 'T12:00:00Z');
   return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === x;
  };
  const optionalDate = x => x === undefined || date(x);
  const time = x => x === undefined || x === '' || (typeof x === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x));
  const unique = xs => new Set(xs.map(x => x.id)).size === xs.length;
  if (!map(d) || new TextEncoder().encode(JSON.stringify(d)).length > 650000) return false;
  const safeKeys = x => !x || typeof x !== 'object' || Object.entries(x).every(([k,v]) => !['__proto__','constructor','prototype'].includes(k) && safeKeys(v));
  if (!safeKeys(d)) return false;
  if (!['tasks','projects','habits','goals'].every(k => Array.isArray(d[k]) && d[k].length <= 3000 && d[k].every(id) && unique(d[k]))) return false;
  if (!map(d.survey) || typeof d.survey.done !== 'boolean' || !map(d.survey.answers)) return false;
  for (const [k,v] of Object.entries(d.survey.answers)) {
   if (k === 'areas') { if (!Array.isArray(v) || v.length > 6 || !v.every(n => Number.isInteger(n) && n >= 0 && n < 6)) return false; }
   else if (!Number.isInteger(v) || v < 0 || v > 5) return false;
  }
  if (d.savedFilters !== undefined && (!Array.isArray(d.savedFilters) || d.savedFilters.length > 100 || !d.savedFilters.every(f => id(f) && text(f.name,50) && text(f.query,200)))) return false;
  if (d.activity !== undefined && (!Array.isArray(d.activity) || d.activity.length > 200 || !d.activity.every(a => id(a) && ref(a.taskId) && text(a.title,140) && ['created','updated','completed','deleted'].includes(a.kind) && Number.isFinite(a.at)))) return false;
  if (d.notificationRead !== undefined && (!map(d.notificationRead) || Object.keys(d.notificationRead).length > 5000 || !Object.entries(d.notificationRead).every(([k,v]) => /^[-a-zA-Z0-9_:]{1,200}$/.test(k) && typeof v === 'boolean'))) return false;
  if (d.teams !== undefined && (!Array.isArray(d.teams) || d.teams.length > 50 || !d.teams.every(t => id(t) && text(t.name,50) && Array.isArray(t.members) && t.members.length <= 30 && t.members.every(m => text(m,100))))) return false;
  if (d.awards !== undefined && (!map(d.awards) || !Object.entries(d.awards).every(([k,v]) => /^[a-zA-Z0-9_-]{1,80}$/.test(k) && typeof v === 'boolean'))) return false;
  return d.tasks.every(x => text(x.title,140) && (x.desc === undefined || text(x.desc,500)) && date(x.due) && time(x.time) && optionalDate(x.doneAt) && ref(x.proj) && (x.created === undefined || Number.isFinite(x.created)) && ['low','mid','high'].includes(x.pri) && typeof x.done === 'boolean' && Array.isArray(x.tags) && x.tags.length <= 100 && x.tags.every(t => typeof t === 'string' && /^[\p{L}\p{N}_-]{1,60}$/u.test(t)))
   && d.projects.every(x => text(x.name,30) && color(x.c) && token(x.k) && token(x.ic) && ref(x.team))
   && d.habits.every(x => text(x.name,24) && color(x.c) && token(x.k) && token(x.ic) && Number.isInteger(x.target) && x.target >= 1 && x.target <= 20 && map(x.log) && Object.entries(x.log).every(([k,v]) => k !== '' && date(k) && Number.isInteger(v) && v >= 0 && v <= 20))
   && d.goals.every(x => text(x.title,60) && token(x.k) && ref(x.project) && Number.isFinite(x.pct) && x.pct >= 0 && x.pct <= 100);
 } catch { return false; }
}
if (typeof module !== 'undefined') module.exports = {validState}; else window.validState = validState;
