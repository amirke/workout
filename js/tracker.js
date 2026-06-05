/**
 * tracker.js — workout log stored in localStorage
 * Key format: "log_YYYY-MM-DD_exerciseId"
 * Value: [{set:1, weight:0, reps:0}, ...]
 */

const PREFIX = 'wlog_';

function dateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function storageKey(exerciseId, date = dateKey()) {
  return `${PREFIX}${date}_${exerciseId}`;
}

/** Save sets for an exercise on a given date */
export function saveSets(exerciseId, sets, date = dateKey()) {
  localStorage.setItem(storageKey(exerciseId, date), JSON.stringify(sets));
}

/** Load sets for an exercise on a given date */
export function loadSets(exerciseId, date = dateKey()) {
  const raw = localStorage.getItem(storageKey(exerciseId, date));
  return raw ? JSON.parse(raw) : [];
}

/** Get all logged dates (sorted desc) */
export function loggedDates() {
  const dates = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(PREFIX)) {
      const parts = k.slice(PREFIX.length).split('_');
      dates.add(parts[0]);
    }
  }
  return [...dates].sort().reverse();
}

/** Get all exercises logged on a date */
export function loggedExercisesOnDate(date) {
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith(`${PREFIX}${date}_`)) {
      const exId = k.slice(`${PREFIX}${date}_`.length);
      result[exId] = JSON.parse(localStorage.getItem(k));
    }
  }
  return result;
}

/** Render a set-logger UI into a container element */
export function renderSetLogger(container, exerciseId, numSets = 3) {
  const saved = loadSets(exerciseId);

  let html = `<div class="section-title">רישום סטים</div>`;

  for (let i = 0; i < numSets; i++) {
    const s = saved[i] || {};
    html += `
      <div class="set-log">
        <span class="set-label">סט ${i + 1}</span>
        <input type="number" placeholder="ק&quot;ג" min="0" step="0.5"
               value="${s.weight ?? ''}" data-field="weight" data-set="${i}">
        <input type="number" placeholder="חזרות" min="0"
               value="${s.reps ?? ''}" data-field="reps" data-set="${i}">
      </div>`;
  }

  html += `<button class="btn-save" data-ex="${exerciseId}">שמור סטים</button>`;
  container.innerHTML = html;

  container.querySelector('.btn-save').addEventListener('click', () => {
    const sets = [];
    for (let i = 0; i < numSets; i++) {
      const w = container.querySelector(`input[data-set="${i}"][data-field="weight"]`).value;
      const r = container.querySelector(`input[data-set="${i}"][data-field="reps"]`).value;
      sets.push({ set: i + 1, weight: parseFloat(w) || 0, reps: parseInt(r) || 0 });
    }
    saveSets(exerciseId, sets);
    const btn = container.querySelector('.btn-save');
    btn.textContent = 'נשמר ✓';
    setTimeout(() => { btn.textContent = 'שמור סטים'; }, 1500);
  });
}
