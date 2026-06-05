/**
 * data.js — טעינת נתונים מרכזית עם cache
 * עובד גם מ-root (index.html) וגם מ-pages/
 */

const _cache = {};

function base() {
  // אם הדף נמצא בתיקיית pages/ — צריך ../
  return location.pathname.includes('/pages/') ? '../' : './';
}

async function fetchJSON(path) {
  if (_cache[path]) return _cache[path];
  const r = await fetch(base() + path);
  if (!r.ok) throw new Error(`לא ניתן לטעון: ${path} (${r.status})`);
  _cache[path] = await r.json();
  return _cache[path];
}

// ── טעינות בסיסיות ──────────────────────────────
export const loadPlan      = () => fetchJSON('data/plan.json');
export const loadExercises = () => fetchJSON('data/exercises.json');

// ── תרגילים לפי מזהים ────────────────────────────
export async function getExercisesByIds(ids) {
  const all = await loadExercises();
  return ids.map(id => all.find(e => e.id === id)).filter(Boolean);
}

// ── תכנית היום ───────────────────────────────────
export async function getTodayPlan() {
  const plan = await loadPlan();
  const key  = todayKey();
  return plan.week.find(d => d.day === key) || null;
}

// ── יום השבוע ────────────────────────────────────
export function todayKey() {
  const map = {
    0: 'saturday', 1: 'sunday',  2: 'monday',
    3: 'tuesday',  4: 'wednesday', 5: 'thursday', 6: 'friday'
  };
  return map[new Date().getDay()];
}

// ── תוויות ───────────────────────────────────────
export const DAY_LABELS = {
  sunday: 'ראשון', monday: 'שני',   tuesday: 'שלישי',
  wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת'
};

export const TYPE_ICONS  = { strength: '🏋️', cardio: '🏃', rest: '😴' };
export const TYPE_COLORS = { strength: 'purple', cardio: 'green', rest: 'gray' };

// ── מצב אימון: gym / home ─────────────────────────
const MODE_KEY = 'workoutMode';

export function getMode() {
  return localStorage.getItem(MODE_KEY) || 'gym';
}

export function setMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}

export async function getExercisesForDay(dayPlan) {
  const mode = getMode();
  const ids  = (mode === 'home' ? dayPlan.home_exercise_ids : dayPlan.gym_exercise_ids)
               ?? dayPlan.exercise_ids ?? [];
  return getExercisesByIds(ids);
}
