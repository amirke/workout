/**
 * app.js — navigation, routing, shared utilities
 */

const DAY_MAP = {
  0: 'saturday',
  1: 'sunday',
  2: 'monday',
  3: 'tuesday',
  4: 'wednesday',
  5: 'thursday',
  6: 'friday'
};

export function todayKey() {
  return DAY_MAP[new Date().getDay()];
}

/** Load JSON from /data/ folder */
export async function loadJSON(name) {
  const res = await fetch(`../data/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}.json`);
  return res.json();
}

/** Highlight today's day card on the dashboard */
export function markTodayCard() {
  const today = todayKey();
  document.querySelectorAll('[data-day]').forEach(el => {
    if (el.dataset.day === today) el.classList.add('today');
  });
}

/** Simple tab switcher — pass container selector + tab/panel selectors */
export function initTabs(containerSel, tabSel, panelSel) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  const tabs   = [...container.querySelectorAll(tabSel)];
  const panels = [...container.querySelectorAll(panelSel)];

  function activate(idx) {
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
    panels.forEach((p, i) => {
      p.hidden = (i !== idx);
      p.style.display = (i !== idx) ? 'none' : '';
    });
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => activate(i)));
  activate(0);
}

/** Format seconds to m:ss */
export function fmtTime(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/** Emit a DOM ready event so pages can defer init */
document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new CustomEvent('appReady'));
});
