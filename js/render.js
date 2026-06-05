/**
 * render.js — אורכסטרציה של עמודים (ללא ES modules)
 * תלוי ב: data.js, components.js, tracker.js
 * חושף: window.Render
 */
window.Render = (() => {

  // ── עזרים ────────────────────────────────────
  function wireLoggers(container) {
    container.querySelectorAll('.set-logger[data-ex]').forEach(el => {
      Tracker.renderSetLogger(el, el.dataset.ex, parseInt(el.dataset.sets) || 3);
    });
  }

  // ── מתג gym/home לאימון כוח ──────────────────
  function modeToggleHTML() {
    const isGym = Data.getMode() === 'gym';
    const on  = 'background:#3C3489;color:#fff';
    const off = 'background:#fff;color:#3C3489';
    return `<div style="display:flex;border-radius:12px;overflow:hidden;
                border:1.5px solid #EEEDFE;width:fit-content;margin-bottom:10px">
      <button id="modeGym"
        style="padding:8px 16px;border:none;cursor:pointer;
               font-family:Heebo,sans-serif;font-size:.85rem;font-weight:700;
               ${isGym ? on : off}">🏋️ חדר כושר</button>
      <button id="modeHome"
        style="padding:8px 16px;border:none;cursor:pointer;
               font-family:Heebo,sans-serif;font-size:.85rem;font-weight:700;
               ${!isGym ? on : off}">🏠 בית</button>
    </div>`;
  }

  // ── מתג קרדיו gym/home ──────────────────────
  function buildCardioToggle(nav, tabs) {
    nav.innerHTML = '';
    const back = document.createElement('button');
    back.className = 'tab-btn';
    back.textContent = '← חזרה';
    back.onclick = () => history.back();
    nav.appendChild(back);

    tabs.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = t.label;
      btn.onclick = () => {
        nav.querySelectorAll('.tab-btn')
           .forEach((b, j) => b.classList.toggle('active', j === i + 1));
        t.fn();
      };
      nav.appendChild(btn);
    });

    // ברירת מחדל לפי mode שמור
    const isHome = Data.getMode() === 'home';
    const idx = isHome ? 1 : 0;
    setTimeout(() => {
      nav.querySelectorAll('.tab-btn')
         .forEach((b, j) => b.classList.toggle('active', j === idx + 1));
      tabs[idx].fn();
    }, 0);
  }

  // ─────────────────────────────────────────────
  // 1. דף כוח (day1 / day3 / day5)
  // ─────────────────────────────────────────────
  function renderStrengthPage(dayKey) {
    const content = document.getElementById('content');
    const titleEl = document.getElementById('pageTitle');
    const nav     = document.getElementById('exNav');

    const plan    = Data.getPlan();
    if (!plan) { content.innerHTML = '<div class="card">שגיאה: נתונים לא נטענו</div>'; return; }

    const dayPlan = plan.week.find(d => d.day === dayKey);
    if (!dayPlan) { content.innerHTML = '<div class="card">יום לא נמצא</div>'; return; }

    let exercises = [];

    function showEx(idx) {
      content.innerHTML = UI.exerciseCard(exercises[idx], idx);
      wireLoggers(content);
    }

    function load() {
      exercises = Data.getExercisesForDay(dayPlan);
      const mode   = Data.getMode();
      const modeHe = mode === 'gym' ? 'חדר כושר' : 'בית';
      if (titleEl) titleEl.textContent = '🏋️ ' + dayPlan.label + ' — ' + modeHe;

      if (nav) UI.buildExNav(nav, exercises, showEx);

      content.innerHTML = `
        <div class="card" style="margin-bottom:8px">
          ${modeToggleHTML()}
          <div class="badge-row">
            ${UI.badge(dayPlan.label, 'purple')}
            ${UI.badge(exercises.length + ' תרגילים', 'gray')}
          </div>
          ${UI.alertBox('חימום 5 דקות לפני התחלה — הליכה + סיבובי כתפיים', 'info')}
        </div>`;

      content.querySelector('#modeGym')?.addEventListener('click', () => {
        Data.setMode('gym'); load();
      });
      content.querySelector('#modeHome')?.addEventListener('click', () => {
        Data.setMode('home'); load();
      });

      showEx(0);
    }

    load();
  }

  // ─────────────────────────────────────────────
  // 2. דף קרדיו LISS (day2)
  // ─────────────────────────────────────────────
  function renderLissPage() {
    const content = document.getElementById('content');
    const titleEl = document.getElementById('pageTitle');
    const nav     = document.getElementById('exNav');

    function showGym() {
      if (titleEl) titleEl.textContent = '🏃 קרדיו — LISS';
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background:#E1F5EE">🎯</div>
            <div>
              <div class="card-title">LISS — קרדיו נמוך ועקבי</div>
              <div class="card-subtitle">Low Intensity Steady State — 35–45 דקות בדופק 60–70%</div>
            </div>
          </div>
          <div class="cardio-zone">
            ${UI.cardioZone('משך', '35–45', 'דקות')}
            ${UI.cardioZone('דופק יעד', '60–70%', 'מקסימום')}
          </div>
        </div>
        <div class="card">
          <div class="section-title">ציוד בחדר כושר</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
            <div class="alert-box info" style="margin:0">🏃 הליכון</div>
            <div class="alert-box info" style="margin:0">🌀 אליפטי</div>
            <div class="alert-box info" style="margin:0">🚴 אופניים</div>
            <div class="alert-box info" style="margin:0">🚣 חתירה</div>
          </div>
        </div>
        <div class="card">
          <div class="section-title">מחשבון דופק</div>
          <div class="hr-calc mt-8">
            <label>גיל: <strong id="ageVal">30</strong></label>
            <input type="range" min="18" max="70" value="30" id="ageSlider">
            <div class="hr-output mt-8">
              <div class="hr-zone"><div class="val" id="hrMax">190</div><div class="lbl">מקסימום</div></div>
              <div class="hr-zone"><div class="val" id="hr60">114</div><div class="lbl">60%</div></div>
              <div class="hr-zone"><div class="val" id="hr70">133</div><div class="lbl">70%</div></div>
            </div>
          </div>
        </div>
        ${UI.alertBox('ניתן להאזין לפודקאסט/מוזיקה — הדופק יעזור לשמור קצב', 'tip')}
        ${UI.alertBox('אל תפסיק בפתאומיות — הורד קצב בהדרגה 3–5 דקות לפני הסוף', 'warn')}`;

      const slider = content.querySelector('#ageSlider');
      const upd = () => {
        const age = +slider.value, max = 220 - age;
        content.querySelector('#ageVal').textContent = age;
        content.querySelector('#hrMax').textContent  = max;
        content.querySelector('#hr60').textContent   = Math.round(max * 0.6);
        content.querySelector('#hr70').textContent   = Math.round(max * 0.7);
      };
      slider?.addEventListener('input', upd); upd?.();
    }

    function showHome() {
      if (titleEl) titleEl.textContent = '🏠 קרדיו — בית';
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background:#E1F5EE">🏠</div>
            <div>
              <div class="card-title">LISS בית — ללא ציוד</div>
              <div class="card-subtitle">35–45 דקות בקצב שמאפשר שיחה</div>
            </div>
          </div>
          <div class="cardio-zone">
            ${UI.cardioZone('משך', '35–45', 'דקות')}
            ${UI.cardioZone('עצימות', 'נמוכה', 'שיחה אפשרית')}
          </div>
        </div>
        <div class="card">
          <div class="section-title">אפשרויות בית</div>
          <ul class="steps-list mt-8">
            <li class="step">
              <div class="step-num" style="background:#085041">1</div>
              <div><div class="step-action">🚶 הליכה בחוץ</div>
                   <div class="step-detail">35–45 דקות בקצב מהיר — הכי טוב לשומן ולמנטלי</div></div>
            </li>
            <li class="step">
              <div class="step-num" style="background:#085041">2</div>
              <div><div class="step-action">🪃 קפיצה בחבל</div>
                   <div class="step-detail">35 דקות בקצב אחיד — קרוב לאליפטי בעצימות</div></div>
            </li>
            <li class="step">
              <div class="step-num" style="background:#085041">3</div>
              <div><div class="step-action">🕺 ריקוד חופשי</div>
                   <div class="step-detail">35 דקות מוזיקה אהובה — קרדיו מהנה ואפקטיבי</div></div>
            </li>
            <li class="step">
              <div class="step-num" style="background:#085041">4</div>
              <div><div class="step-action">🏠 מדרגות</div>
                   <div class="step-detail">עלייה וירידה ברצף — 30–40 דקות</div></div>
            </li>
          </ul>
          ${UI.alertBox('הליכה בחוץ = הכי טוב: אוויר + ויטמין D + שריפת שומן', 'tip')}
        </div>`;
    }

    if (nav) {
      buildCardioToggle(nav, [
        { label: '🏋️ חדר כושר', fn: showGym },
        { label: '🏠 בית',      fn: showHome }
      ]);
    } else { showGym(); }
  }

  // ─────────────────────────────────────────────
  // 3. דף קרדיו HIIT/LISS (day6)
  // ─────────────────────────────────────────────
  function renderHiitLissPage() {
    const content = document.getElementById('content');
    const titleEl = document.getElementById('pageTitle');
    const nav     = document.getElementById('exNav');

    function wireHIIT() {
      const tracker = content.querySelector('#setTracker');
      if (!tracker) return;
      const done = new Array(8).fill(false);
      const render = () => {
        tracker.innerHTML = '';
        done.forEach((d, i) => {
          const btn = document.createElement('button');
          btn.style.cssText = [
            'padding:14px 0','border-radius:10px','border:1.5px solid',
            "font-family:Heebo,sans-serif","font-size:.9rem","font-weight:700","cursor:pointer",
            'background:' + (d ? '#085041' : '#E1F5EE'),
            'color:'       + (d ? '#fff'    : '#085041'),
            'border-color:'+ (d ? '#085041' : '#c0e8d8')
          ].join(';');
          btn.textContent = d ? '✓ ' + (i + 1) : '' + (i + 1);
          btn.onclick = () => { done[i] = !done[i]; render(); };
          tracker.appendChild(btn);
        });
      };
      content.querySelector('#resetBtn').onclick = () => { done.fill(false); render(); };
      render();
    }

    function showHiitGym() {
      if (titleEl) titleEl.textContent = '⚡ HIIT — חדר כושר';
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
            ${UI.badge('⏱ 20 דקות', 'green')}
            ${UI.badge('🔁 8 סטים', 'green')}
          </div>
        </div>
        <div class="card">
          <div class="section-title">מבנה הסט</div>
          <div class="hiit-bar mt-8">
            <div class="hiit-work">30″ מאמץ</div>
            <div class="hiit-rest">90″ מנוחה</div>
          </div>
          ${UI.alertBox('יחס 1:3 — מאמץ/מנוחה. מאמץ = 85–95% מקסימום דופק', 'info')}
        </div>
        <div class="card">
          <div class="section-title">אפשרויות לבחירה</div>
          <ul class="steps-list mt-8">
            <li class="step"><div class="step-num" style="background:#085041">1</div>
              <div><div class="step-action">ספרינט על הליכון</div>
                   <div class="step-detail">10–12 קמ"ש 30 שניות, 3–4 קמ"ש 90 שניות</div></div></li>
            <li class="step"><div class="step-num" style="background:#085041">2</div>
              <div><div class="step-action">אליפטי</div>
                   <div class="step-detail">התנגדות גבוהה 30 שניות, נמוכה 90 שניות</div></div></li>
            <li class="step"><div class="step-num" style="background:#085041">3</div>
              <div><div class="step-action">אופניים</div>
                   <div class="step-detail">עמידה+מהר 30 שניות, ישיבה+נמוך 90 שניות</div></div></li>
          </ul>
        </div>
        <div class="card">
          <div class="section-title">מעקב 8 סטים</div>
          <div id="setTracker" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px"></div>
          <button class="btn-save mt-8" id="resetBtn">איפוס</button>
        </div>
        ${UI.alertBox('אם עייף מדי — עבור ל-LISS. LISS עדיף על HIIT רע', 'warn')}`;
      wireHIIT();
    }

    function showHiitHome() {
      if (titleEl) titleEl.textContent = '🏠 HIIT — בית';
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background:#E1F5EE">🏠⚡</div>
            <div>
              <div class="card-title">HIIT בית — ללא ציוד</div>
              <div class="card-subtitle">8 × (30″ עבודה + 90″ מנוחה) = 20 דקות</div>
            </div>
          </div>
          <div class="badge-row">
            ${UI.badge('⏱ 20 דקות', 'green')}
            ${UI.badge('🔁 8 סטים', 'green')}
            ${UI.badge('🏠 ללא ציוד', 'orange')}
          </div>
        </div>
        <div class="card">
          <div class="section-title">בחר תרגיל אחד לכל סט</div>
          <ul class="steps-list mt-8">
            <li class="step"><div class="step-num" style="background:#085041">1</div>
              <div><div class="step-action">🦘 ניתורי סקוואט</div>
                   <div class="step-detail">שב לסקוואט → קפוץ מעלה בכוח — 30 שניות</div></div></li>
            <li class="step"><div class="step-num" style="background:#085041">2</div>
              <div><div class="step-action">🏃 מטפס הרים</div>
                   <div class="step-detail">פלאנק → קרב ברכיים לחזה לסירוגין במהירות</div></div></li>
            <li class="step"><div class="step-num" style="background:#085041">3</div>
              <div><div class="step-action">⭐ Burpees</div>
                   <div class="step-detail">שפיפה → פלאנק → סמיכה → קפיצה — קלאסיק</div></div></li>
            <li class="step"><div class="step-num" style="background:#085041">4</div>
              <div><div class="step-action">🦵 ניתורי מכרע</div>
                   <div class="step-detail">מכרע → קפוץ → החלף רגליים באוויר</div></div></li>
          </ul>
        </div>
        <div class="card">
          <div class="section-title">מעקב 8 סטים</div>
          <div id="setTracker" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px"></div>
          <button class="btn-save mt-8" id="resetBtn">איפוס</button>
        </div>
        ${UI.alertBox('אחרי כל סט — הליכה במקום 90 שניות. אל תשב!', 'info')}
        ${UI.alertBox('אם עייף מדי — עשה LISS 35 דקות', 'warn')}`;
      wireHIIT();
    }

    function showLiss() {
      if (titleEl) titleEl.textContent = '🌊 LISS';
      content.innerHTML = `
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background:#E1F5EE">🌊</div>
            <div>
              <div class="card-title">LISS — חלופה אם עייף</div>
              <div class="card-subtitle">35 דקות בדופק 60–70%</div>
            </div>
          </div>
          <div class="cardio-zone">
            ${UI.cardioZone('משך', '35', 'דקות')}
            ${UI.cardioZone('דופק', '60–70%', 'מקסימום')}
          </div>
          ${UI.alertBox('כל אימון קרדיו טוב יותר מלא כלום', 'tip')}
        </div>`;
    }

    if (nav) {
      buildCardioToggle(nav, [
        { label: '⚡ HIIT חדר', fn: showHiitGym },
        { label: '🏠 HIIT בית', fn: showHiitHome },
        { label: '🌊 LISS',     fn: showLiss }
      ]);
    } else { showHiitGym(); }
  }

  // ─────────────────────────────────────────────
  // 4. דף מנוחה
  // ─────────────────────────────────────────────
  function renderRestPage() {
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
        ${UI.alertBox('התאוששות טובה = ביצועים טובים יותר באימון הבא', 'info')}
      </div>
      <div class="card">
        <div class="section-title">מה לעשות היום</div>
        <div class="rest-tips mt-8">
          <div class="rest-tip-item">💧 <span><strong>שתיית מים</strong> — לפחות 2–3 ליטר</span></div>
          <div class="rest-tip-item">🥩 <span><strong>חלבון מספיק</strong> — 1.6–2g לק"ג משקל גוף</span></div>
          <div class="rest-tip-item">😴 <span><strong>שינה 7–8 שעות</strong></span></div>
          <div class="rest-tip-item">🚶 <span><strong>הליכה קלה</strong> — 15–20 דקות</span></div>
          <div class="rest-tip-item">🧘 <span><strong>מתיחות קלות</strong></span></div>
        </div>
      </div>
      ${UI.alertBox('קטו + מנוחה = גוף שורף שומן ביעילות. זה חלק מהתכנית!', 'tip')}`;
  }

  // ─────────────────────────────────────────────
  // 5. דשבורד (index.html)
  // ─────────────────────────────────────────────
  function renderDashboard() {
    const listEl   = document.getElementById('dayList');
    const bannerEl = document.getElementById('todayBanner');
    const todayEl  = document.getElementById('todayContent');

    const plan  = Data.getPlan();
    if (!plan) { if (listEl) listEl.innerHTML = '<div class="card">שגיאה בטעינת הנתונים</div>'; return; }

    const today     = Data.todayKey();
    const todayPlan = plan.week.find(d => d.day === today);

    if (bannerEl && todayPlan) {
      bannerEl.textContent =
        'היום: ' + Data.DAY_LABELS[today] + ' — ' + todayPlan.label + ' (' + todayPlan.subtitle + ')';
    }

    if (todayEl && todayPlan) {
      todayEl.innerHTML = UI.todayShortcut(todayPlan);
    }

    if (listEl) {
      plan.week.forEach(d => {
        listEl.insertAdjacentHTML('beforeend', UI.dayCard(d, d.day === today));
      });
    }
  }

  return {
    renderStrengthPage,
    renderLissPage,
    renderHiitLissPage,
    renderRestPage,
    renderDashboard
  };
})();
