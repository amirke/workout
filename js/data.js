/**
 * data.js — טעינת נתונים מרכזית עם cache
 * עובד גם מ-root (index.html) וגם מ-pages/
 */

// ── טעינת נתונים: globals קודם, אחר כך fetch ─────
// globals נטענים דרך <script src="data/exercises-data.js"> בכל HTML
// זה מאפשר עבודה גם עם file:// (ללא שרת)

async function loadData(globalKey, jsonPath) {
  // אם הנתונים כבר זמינים כ-global (טעון דרך <script>) — השתמש בהם
  if (window[globalKey]) return window[globalKey];

  // אחרת — נסה fetch (עובד ב-http:// ו-https://)
  const base = location.pathname.includes('/pages/') ? '../' : './';
  const r = await fetch(base + jsonPath);
  if (!r.ok) throw new Error(`לא ניתן לטעון: ${jsonPath}`);
  return r.json();
}

// ── טעינות בסיסיות ──────────────────────────────
export const loadPlan      = () => loadData('__PLAN',      'data/plan.json');
export const loadExercises = () => loadData('__EXERCISES', 'data/exercises.json');

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
