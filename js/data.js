/**
 * data.js — טעינת נתונים (ללא ES modules — עובד עם file://)
 * חושף: window.Data
 */
window.Data = (() => {

  const MODE_KEY = 'workoutMode';
  const VALID_MODES = ['gym', 'home', 'suspension', 'band'];

  // ── Mode ──────────────────────────────────────
  function getMode() {
    const m = localStorage.getItem(MODE_KEY);
    return VALID_MODES.includes(m) ? m : 'gym';
  }
  function setMode(mode) { localStorage.setItem(MODE_KEY, mode); }

  // ── Globals ───────────────────────────────────
  function getPlan()      { return window.__PLAN; }
  function getExercises() { return window.__EXERCISES || []; }

  // ── תרגילים לפי IDs ──────────────────────────
  function getExercisesByIds(ids) {
    const all = getExercises();
    return (ids || []).map(id => all.find(e => e.id === id)).filter(Boolean);
  }

  // ── תרגילים ליום לפי mode ─────────────────────
  function getExercisesForDay(dayPlan) {
    const mode = getMode();
    const key  = mode + '_exercise_ids';
    const ids  = dayPlan[key] ?? dayPlan.exercise_ids ?? [];
    return getExercisesByIds(ids);
  }

  // ── חימום לפי סוג ────────────────────────────
  const WARMUP = {
    chest_shoulders: {
      title: 'חימום — חזה + כתפיים',
      duration: '5 דקות',
      steps: [
        { action: 'סיבובי כתפיים', detail: '10 חזרות קדימה + 10 אחורה, לאט ובשליטה' },
        { action: 'מתיחת חזה', detail: 'ידיים מאחורי גב, מרחב חזה קדימה — 30 שניות' },
        { action: 'סיבובי מרפקים', detail: '10 חזרות בכל כיוון — מחמם מפרקי הגף העליון' },
        { action: 'שכיבות סמיכה קלות', detail: '10–15 חזרות לאט — מחמם שרירי הגף העליון' },
        { action: 'מתיחת דלתואיד', detail: 'משוך יד אחת לרוחב הגוף — 20 שניות כל צד' }
      ]
    },
    back_biceps: {
      title: 'חימום — גב + ביצפס',
      duration: '5 דקות',
      steps: [
        { action: 'סיבובי כתפיים', detail: '10 חזרות קדימה + 10 אחורה' },
        { action: 'חתירה אוויר', detail: '15 חזרות — תנועת חתירה ללא משקל לחימום הגב' },
        { action: 'מתיחת גב עליון', detail: 'הצלב ידיים מאחורי הראש, כוון שכמות — 30 שניות' },
        { action: 'כפיפת מרפק ריקה', detail: '15 חזרות — מחמם ביצפס ומרפק' },
        { action: 'קיר חתול-פרה', detail: '10 חזרות — מחמם עמוד השדרה לפני עבודת גב' }
      ]
    },
    legs_core: {
      title: 'חימום — רגליים + ליבה',
      duration: '5 דקות',
      steps: [
        { action: 'הליכה במקום', detail: '60 שניות בקצב מהיר — מגביר דופק' },
        { action: 'סיבובי ירכיים', detail: '10 חזרות לכל כיוון — מחמם מפרק הירך' },
        { action: 'סקוואט אוויר', detail: '15 חזרות לאט — מכין ברכיים וירכיים' },
        { action: 'מתיחת ירך קדמית', detail: 'משוך קרסול לאחור — 20 שניות כל צד' },
        { action: 'מכרע הליכה', detail: '10 צעדים קדימה — מכין שרירי הרגל לטווח מלא' }
      ]
    }
  };

  function getWarmup(warmupKey) {
    return WARMUP[warmupKey] || null;
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

  const MODE_CONFIG = {
    gym:        { label: '🏋️ חדר כושר', short: '🏋️ חדר' },
    home:       { label: '🏠 בית',       short: '🏠 בית'   },
    suspension: { label: '🪢 רצועות',    short: '🪢 רצועות' },
    band:       { label: '🔴 גומיות',    short: '🔴 גומיות' }
  };

  return {
    getMode, setMode, VALID_MODES, MODE_CONFIG,
    getPlan, getExercises, getExercisesByIds, getExercisesForDay,
    getWarmup, todayKey, DAY_LABELS, TYPE_ICONS, TYPE_COLORS
  };
})();
