/**
 * render.js — אורכסטרציה של עמודים
 * כל פונקציה מקבלת נתונים → מרנדרת ל-DOM
 */
import { loadPlan, getExercisesByIds, getExercisesForDay, getMode, setMode, todayKey, DAY_LABELS } from './data.js';
import {
  exerciseCard, dayCard, todayShortcut,
  alertBox, badge, muscleSection, stepsList,
  buildExNav, cardioZone
} from './components.js';
import { renderSetLogger } from './tracker.js';

// ── עזר: חיווט set-loggers ────────────────────────
function wireLoggers(container) {
  container.querySelectorAll('.set-logger[data-ex]').forEach(el => {
    renderSetLogger(el, el.dataset.ex, parseInt(el.dataset.sets) || 3);
  });
}

// ── עזר: נתיב תמונה מותאם למיקום ─────────────────
function imgPath(path) {
  if (!path) return null;
  return location.pathname.includes('/pages/') ? '../' + path : path;
}

// ─────────────────────────────────────────────────
// 1. דף כוח (day1 / day3 / day5)
// ─────────────────────────────────────────────────
export async function renderStrengthPage(dayKey) {
  const content  = document.getElementById('content');
  const titleEl  = document.getElementById('pageTitle');
  const nav      = document.getElementById('exNav');

  try {
    const plan    = await loadPlan();
    const dayPlan = plan.week.find(d => d.day === dayKey);
    if (!dayPlan) throw new Error(`לא נמצא יום: ${dayKey}`);

    // ── מתג gym / home ────────────────────────────
    let currentMode = getMode();

    function modeToggleHTML() {
      const isGym  = currentMode === 'gym';
      return `
        <div class="mode-toggle" style="
          display:flex;gap:0;border-radius:12px;overflow:hidden;border:1.5px solid #EEEDFE;
          width:fit-content;margin-bottom:12px">
          <button id="modeGym"
            style="padding:8px 18px;border:none;cursor:pointer;font-family:Heebo,sans-serif;font-size:.85rem;font-weight:700;
              background:${isGym  ? '#3C3489' : '#fff'};color:${isGym  ? '#fff' : '#3C3489'}">
            🏋️ חדר כושר
          </button>
          <button id="modeHome"
            style="padding:8px 18px;border:none;cursor:pointer;font-family:Heebo,sans-serif;font-size:.85rem;font-weight:700;
              background:${!isGym ? '#3C3489' : '#fff'};color:${!isGym ? '#fff' : '#3C3489'}">
            🏠 בית
          </button>
        </div>`;
    }

    // ── חימום ─────────────────────────────────────
    function renderWarmup(exercises) {
      const modeLabel = currentMode === 'gym' ? '🏋️ חדר כושר' : '🏠 בית';
      content.innerHTML = `
        <div class="card" style="margin-bottom:8px">
          ${modeToggleHTML()}
          <div class="badge-row">
            ${badge(`${modeLabel}`, currentMode === 'gym' ? 'purple' : 'orange')}
            ${badge(`${dayPlan.label}`, 'purple')}
            ${badge(`${exercises.length} תרגילים`, 'gray')}
          </div>
          ${alertBox('חימום 5 דקות לפני התחלה — הליכה + סיבובי כתפיים', 'info')}
        </div>`;

      // חיווט כפתורי מצב
      content.querySelector('#modeGym')?.addEventListener('click', () => switchMode('gym'));
      content.querySelector('#modeHome')?.addEventListener('click', () => switchMode('home'));
    }

    // ── החלפת מצב ─────────────────────────────────
    async function switchMode(mode) {
      if (mode === currentMode) return;
      currentMode = mode;
      setMode(mode);
      await reloadExercises();
    }

    // ── טעינה/רענון ────────────────────────────────
    let exercises = [];

    async function reloadExercises() {
      exercises = await getExercisesForDay(dayPlan);
      if (titleEl) {
        const modeHe = currentMode === 'gym' ? 'חדר כושר' : 'בית';
        titleEl.textContent = `🏋️ ${dayPlan.label} — ${modeHe}`;
      }

      // בנה מחדש את ה-nav
      if (nav) {
        nav.innerHTML = '';
        buildExNav(nav, exercises, showEx);
      }
      renderWarmup(exercises);
    }

    // ── הצגת תרגיל ────────────────────────────────
    function showEx(idx) {
      const ex = exercises[idx];
      const exData = { ...ex, image: imgPath(ex.image) };
      content.innerHTML = exerciseCard(exData, idx);
      wireLoggers(content);
    }

    await reloadExercises();

  } catch (err) {
    content.innerHTML = `<div class="card">${alertBox(err.message, 'warn')}</div>`;
  }
}

// ─────────────────────────────────────────────────
// 2. דף קרדיו LISS (day2 — שני)
// ─────────────────────────────────────────────────
export function renderLissPage() {
  const content = document.getElementById('content');
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = '🏃 קרדיו — LISS';

  content.innerHTML = `
    <!-- Overview -->
    <div class="card">
      <div class="card-header">
        <div class="card-icon" style="background:#E1F5EE">🎯</div>
        <div>
          <div class="card-title">LISS — קרדיו נמוך ועקבי</div>
          <div class="card-subtitle">Low Intensity Steady State</div>
        </div>
      </div>
      <div class="cardio-zone">
        ${cardioZone('משך', '35–45', 'דקות')}
        ${cardioZone('דופק יעד', '60–70%', 'מקסימום')}
      </div>
    </div>

    <!-- ציוד -->
    <div class="card">
      <div class="section-title">אפשרויות ציוד</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <div class="alert-box info" style="margin:0">🏃 הליכון</div>
        <div class="alert-box info" style="margin:0">🌀 אליפטי</div>
        <div class="alert-box info" style="margin:0">🚴 אופניים</div>
        <div class="alert-box info" style="margin:0">🚣 חתירה</div>
      </div>
    </div>

    <!-- מחשבון דופק -->
    <div class="card">
      <div class="section-title">מחשבון דופק</div>
      <div class="hr-calc mt-8">
        <label>גיל: <strong id="ageVal">30</strong></label>
        <input type="range" min="18" max="70" value="30" id="ageSlider">
        <div class="hr-output mt-8">
          <div class="hr-zone">
            <div class="val" id="hrMax">190</div>
            <div class="lbl">מקסימום</div>
          </div>
          <div class="hr-zone">
            <div class="val" id="hr60">114</div>
            <div class="lbl">60% (מינימום)</div>
          </div>
          <div class="hr-zone">
            <div class="val" id="hr70">133</div>
            <div class="lbl">70% (מקסימום)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- חימום -->
    <div class="card">
      <div class="section-title">חימום — 5 דקות</div>
      <ul class="steps-list mt-8">
        <li class="step">
          <div class="step-num" style="background:#085041">1</div>
          <div><div class="step-action">הליכה קלה</div><div class="step-detail">3–4 דקות, קצב נמוך מאוד</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#085041">2</div>
          <div><div class="step-action">הגברה הדרגתית</div><div class="step-detail">עלייה לדופק יעד בדקה האחרונה</div></div>
        </li>
      </ul>
    </div>

    <!-- אימון עיקרי -->
    <div class="card">
      <div class="section-title">אימון עיקרי — 30–40 דקות</div>
      <ul class="steps-list mt-8">
        <li class="step">
          <div class="step-num" style="background:#085041">1</div>
          <div><div class="step-action">דופק יציב</div><div class="step-detail">60–70% מקסימום — ניתן לנהל שיחה</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#085041">2</div>
          <div><div class="step-action">אפשר לשנות מכשיר</div><div class="step-detail">כל 10–15 דקות</div></div>
        </li>
      </ul>
      ${alertBox('ניתן להאזין לפודקאסט/מוזיקה — הדופק יעזור לשמור קצב', 'tip')}
    </div>

    <!-- מתיחות -->
    <div class="card">
      <div class="section-title">קירור — מתיחות 5–10 דקות</div>
      <ul class="steps-list mt-8">
        <li class="step">
          <div class="step-num" style="background:#085041">1</div>
          <div><div class="step-action">ירך קדמית</div><div class="step-detail">משוך קרסול לאחור — 30 שניות כל צד</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#085041">2</div>
          <div><div class="step-action">כלבי ירך</div><div class="step-detail">שב, רגל ישרה, התכופף קדימה — 30 שניות</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#085041">3</div>
          <div><div class="step-action">שוק</div><div class="step-detail">לחץ על קיר, עקב לרצפה — 30 שניות</div></div>
        </li>
      </ul>
      ${alertBox('אל תפסיק בפתאומיות — הורד קצב בהדרגה 3–5 דקות לפני הסוף', 'warn')}
    </div>`;

  // חיווט מחשבון דופק
  const slider = content.querySelector('#ageSlider');
  const update = () => {
    const age = +slider.value;
    const max = 220 - age;
    content.querySelector('#ageVal').textContent = age;
    content.querySelector('#hrMax').textContent  = max;
    content.querySelector('#hr60').textContent   = Math.round(max * 0.6);
    content.querySelector('#hr70').textContent   = Math.round(max * 0.7);
  };
  slider?.addEventListener('input', update);
  update?.();
}

// ─────────────────────────────────────────────────
// 3. דף קרדיו שישי — HIIT / LISS
// ─────────────────────────────────────────────────
export function renderHiitLissPage() {
  const content = document.getElementById('content');
  const titleEl = document.getElementById('pageTitle');
  const nav     = document.getElementById('exNav');
  if (titleEl) titleEl.textContent = '🏃 קרדיו — שישי';

  // הוסף טאבי HIIT / LISS לנאב
  if (nav) {
    const back = document.createElement('button');
    back.className = 'tab-btn active';
    back.textContent = '← חזרה';
    back.onclick = () => history.back();
    nav.appendChild(back);

    ['HIIT', 'LISS'].forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = label;
      btn.onclick = () => {
        nav.querySelectorAll('.tab-btn')
           .forEach((b, j) => b.classList.toggle('active', j === i + 1));
        i === 0 ? showHiit() : showLiss();
      };
      nav.appendChild(btn);
    });
    nav.querySelectorAll('.tab-btn')[1]?.classList.add('active');
    nav.querySelectorAll('.tab-btn')[0]?.classList.remove('active');
  }

  function showHiit() {
    if (titleEl) titleEl.textContent = '⚡ קרדיו — HIIT';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:#E1F5EE">⚡</div>
          <div>
            <div class="card-title">HIIT — מרווחי עצימות</div>
            <div class="card-subtitle">High Intensity Interval Training</div>
          </div>
        </div>
        <div class="badge-row">
          ${badge('⏱ 20 דקות סה"כ', 'green')}
          ${badge('🔁 8 סטים', 'green')}
        </div>
      </div>

      <div class="card">
        <div class="section-title">מבנה הסט</div>
        <div class="hiit-bar mt-8">
          <div class="hiit-work">30″ מאמץ</div>
          <div class="hiit-rest">90″ מנוחה</div>
        </div>
        ${alertBox('יחס 1:3 — מאמץ/מנוחה. מאמץ = 85–95% מקסימום דופק', 'info')}
      </div>

      <div class="card">
        <div class="section-title">מעקב 8 סטים</div>
        <div id="setTracker" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px"></div>
        <button class="btn-save mt-8" id="resetBtn">איפוס</button>
      </div>

      <div class="card">
        <div class="section-title">אפשרויות לבחירה</div>
        <ul class="steps-list mt-8">
          <li class="step">
            <div class="step-num" style="background:#085041">1</div>
            <div><div class="step-action">ספרינט על הליכון</div><div class="step-detail">10–12 קמ"ש 30 שניות, 3–4 קמ"ש 90 שניות</div></div>
          </li>
          <li class="step">
            <div class="step-num" style="background:#085041">2</div>
            <div><div class="step-action">אליפטי</div><div class="step-detail">התנגדות גבוהה 30 שניות, נמוכה 90 שניות</div></div>
          </li>
          <li class="step">
            <div class="step-num" style="background:#085041">3</div>
            <div><div class="step-action">אופניים</div><div class="step-detail">עמידה/ישיבה ומהר, אחר כך קצב נמוך</div></div>
          </li>
        </ul>
        ${alertBox('אם עייף מדי — עבור ל-LISS. עדיף LISS מאשר HIIT רע', 'warn')}
      </div>`;

    // מעקב סטים
    const tracker = content.querySelector('#setTracker');
    const done    = new Array(8).fill(false);
    const renderSets = () => {
      tracker.innerHTML = '';
      done.forEach((d, i) => {
        const btn = document.createElement('button');
        btn.style.cssText = [
          'padding:14px 0', 'border-radius:10px', 'border:1.5px solid',
          "font-family:Heebo,sans-serif", 'font-size:.9rem', 'font-weight:700', 'cursor:pointer',
          `background:${d ? '#085041' : '#E1F5EE'}`,
          `color:${d ? '#fff' : '#085041'}`,
          `border-color:${d ? '#085041' : '#c0e8d8'}`
        ].join(';');
        btn.textContent = d ? `✓ ${i + 1}` : `${i + 1}`;
        btn.onclick = () => { done[i] = !done[i]; renderSets(); };
        tracker.appendChild(btn);
      });
    };
    content.querySelector('#resetBtn').onclick = () => { done.fill(false); renderSets(); };
    renderSets();
  }

  function showLiss() {
    if (titleEl) titleEl.textContent = '🌊 קרדיו — LISS';
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-icon" style="background:#E1F5EE">🌊</div>
          <div>
            <div class="card-title">LISS — חלופה אם עייף</div>
            <div class="card-subtitle">כל אימון קרדיו טוב יותר מלא כלום</div>
          </div>
        </div>
        <div class="cardio-zone">
          ${cardioZone('משך', '35', 'דקות')}
          ${cardioZone('דופק', '60–70%', 'מקסימום')}
        </div>
        ${alertBox('אם הגוף מבקש — הקשב לו. LISS גם שורף שומן מצוין', 'tip')}
      </div>`;
  }

  showHiit(); // ברירת מחדל
}

// ─────────────────────────────────────────────────
// 4. דף מנוחה
// ─────────────────────────────────────────────────
export function renderRestPage() {
  const content = document.getElementById('content');
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = '😴 יום מנוחה';

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-icon" style="background:#F5F5F5;font-size:1.8rem">💤</div>
        <div>
          <div class="card-title">מנוחה חשובה כמו האימון</div>
          <div class="card-subtitle">השרירים גדלים בזמן המנוחה, לא בזמן האימון</div>
        </div>
      </div>
      ${alertBox('התאוששות טובה = ביצועים טובים יותר באימון הבא', 'info')}
    </div>

    <div class="card">
      <div class="section-title">מה לעשות היום</div>
      <div class="rest-tips mt-8">
        <div class="rest-tip-item">💧 <span><strong>שתיית מים</strong> — לפחות 2–3 ליטר. חיוני לשיקום שרירים</span></div>
        <div class="rest-tip-item">🥩 <span><strong>חלבון מספיק</strong> — 1.6–2g לק"ג משקל גוף ליום</span></div>
        <div class="rest-tip-item">😴 <span><strong>שינה 7–8 שעות</strong> — שם קורה הבנייה</span></div>
        <div class="rest-tip-item">🚶 <span><strong>הליכה קלה</strong> — 15–20 דקות בחוץ מאיץ התאוששות</span></div>
        <div class="rest-tip-item">🧘 <span><strong>מתיחות קלות</strong> — לא לכפות, רק מה שמרגיש טוב</span></div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">מתיחות מומלצות</div>
      <ul class="steps-list mt-8">
        <li class="step">
          <div class="step-num" style="background:#6B6B6B">1</div>
          <div><div class="step-action">חזה פתוח</div><div class="step-detail">ידיים מאחורי גב, ישר ומרחב — 30 שניות</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#6B6B6B">2</div>
          <div><div class="step-action">פיג'ון</div><div class="step-detail">ישבן + ירך בצד — 45 שניות כל צד</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#6B6B6B">3</div>
          <div><div class="step-action">גב חתול-פרה</div><div class="step-detail">על ידיים וברכיים — 10 חזרות לאט</div></div>
        </li>
        <li class="step">
          <div class="step-num" style="background:#6B6B6B">4</div>
          <div><div class="step-action">ילד</div><div class="step-detail">ישיבה על עקבים, ידיים קדימה — 45 שניות</div></div>
        </li>
      </ul>
    </div>

    ${alertBox('קטו + מנוחה = גוף שורף שומן ביעילות. זה חלק מהתכנית!', 'tip')}`;
}

// ─────────────────────────────────────────────────
// 5. דשבורד (index.html)
// ─────────────────────────────────────────────────
export async function renderDashboard() {
  const listEl   = document.getElementById('dayList');
  const bannerEl = document.getElementById('todayBanner');
  const todayEl  = document.getElementById('todayContent');

  try {
    const plan  = await loadPlan();
    const today = todayKey();
    const todayPlan = plan.week.find(d => d.day === today);

    // באנר
    if (bannerEl && todayPlan) {
      bannerEl.textContent =
        `היום: ${DAY_LABELS[today]} — ${todayPlan.label} (${todayPlan.subtitle})`;
    }

    // קיצור דרך להיום
    if (todayEl && todayPlan) {
      todayEl.innerHTML = todayShortcut(todayPlan);
    }

    // רשימת ימים
    if (listEl) {
      plan.week.forEach(d => {
        listEl.insertAdjacentHTML(
          'beforeend',
          dayCard(d, d.day === today)
        );
      });
    }

  } catch (err) {
    if (listEl) listEl.innerHTML =
      `<div class="card">${alertBox('שגיאה בטעינת התכנית: ' + err.message, 'warn')}</div>`;
  }
}
