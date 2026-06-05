/**
 * tracker.js — לוג אימונים ב-localStorage (ללא ES modules)
 * חושף: window.Tracker
 */
window.Tracker = (() => {
  const PREFIX = 'wlog_';

  function dateKey(d) {
    return (d || new Date()).toISOString().slice(0, 10);
  }

  function storageKey(exId, date) {
    return PREFIX + (date || dateKey()) + '_' + exId;
  }

  function saveSets(exId, sets, date) {
    localStorage.setItem(storageKey(exId, date), JSON.stringify(sets));
  }

  function loadSets(exId, date) {
    const raw = localStorage.getItem(storageKey(exId, date));
    return raw ? JSON.parse(raw) : [];
  }

  function renderSetLogger(container, exId, numSets) {
    numSets = numSets || 3;
    const saved = loadSets(exId);
    let html = '<div class="section-title">רישום סטים</div>';

    for (let i = 0; i < numSets; i++) {
      const s = saved[i] || {};
      html += `<div class="set-log">
        <span class="set-label">סט ${i + 1}</span>
        <input type="number" placeholder='ק"ג' min="0" step="0.5"
               value="${s.weight ?? ''}" data-field="weight" data-set="${i}">
        <input type="number" placeholder="חזרות" min="0"
               value="${s.reps ?? ''}" data-field="reps" data-set="${i}">
      </div>`;
    }
    html += `<button class="btn-save" data-ex="${exId}" style="margin-top:8px">שמור סטים</button>`;
    container.innerHTML = html;

    container.querySelector('.btn-save').onclick = () => {
      const sets = [];
      for (let i = 0; i < numSets; i++) {
        const w = container.querySelector(`input[data-set="${i}"][data-field="weight"]`).value;
        const r = container.querySelector(`input[data-set="${i}"][data-field="reps"]`).value;
        sets.push({ set: i + 1, weight: parseFloat(w) || 0, reps: parseInt(r) || 0 });
      }
      saveSets(exId, sets);
      const btn = container.querySelector('.btn-save');
      btn.textContent = 'נשמר ✓';
      setTimeout(() => { btn.textContent = 'שמור סטים'; }, 1500);
    };
  }

  return { saveSets, loadSets, renderSetLogger };
})();
