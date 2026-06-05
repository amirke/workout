/**
 * data.js — טעינת נתונים (ללא ES modules — עובד עם file://)
 * חושף: window.Data
 */
window.Data = (() => {

  const MODE_KEY = 'workoutMode';

  // ── Mode ──────────────────────────────────────
  function getMode()       { return localStorage.getItem(MODE_KEY) || 'gym'; }
  function setMode(mode)   { localStorage.setItem(MODE_KEY, mode); }

  // ── Globals (טעונים דרך exercises-data.js / plan-data.js) ──
  function getPlan()      { return window.__PLAN; }
  function getExercises() { return window.__EXERCISES || []; }

  // ── עזר: תרגילים לפי IDs ──────────────────────
  function getExercisesByIds(ids) {
    const all = getExercises();
    return (ids || []).map(id => all.find(e => e.id === id)).filter(Boolean);
  }

  // ── תרגילים ליום (לפי mode) ───────────────────
  function getExercisesForDay(dayPlan) {
    const mode = getMode();
    const ids  = (mode === 'home' ? dayPlan.home_exercise_ids : dayPlan.gym_exercise_ids)
                 ?? dayPlan.exercise_ids ?? [];
    return getExercisesByIds(ids);
  }

  // ── יום שבוע ──────────────────────────────────
  const DAY_MAP = {
    0: 'saturday', 1: 'sunday',  2: 'monday',
    3: 'tuesday',  4: 'wednesday', 5: 'thursday', 6: 'friday'
  };
  function todayKey() { return DAY_MAP[new Date().getDay()]; }

  const DAY_LABELS = {
    sunday: 'ראשון', monday: 'שני',   tuesday: 'שלישי',
    wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת'
  };

  const TYPE_ICONS  = { strength: '🏋️', cardio: '🏃', rest: '😴' };
  const TYPE_COLORS = { strength: 'purple', cardio: 'green', rest: 'gray' };

  return { getMode, setMode, getPlan, getExercises,
           getExercisesByIds, getExercisesForDay,
           todayKey, DAY_LABELS, TYPE_ICONS, TYPE_COLORS };
})();
