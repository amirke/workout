/**
 * components.js — אבני בניין UI (ללא ES modules)
 * חושף: window.UI
 */
window.UI = (() => {

  // ── נתיב תמונה (מתאים עצמו ל-pages/ או root) ──
  function imgPath(p) {
    if (!p) return null;
    return location.pathname.includes('/pages/') ? '../' + p : p;
  }

  // ── תגיות שרירים ──────────────────────────────
  function muscleTag(muscle, type) {
    const he  = muscle.he  || (typeof muscle === 'string' ? muscle.split('|')[0].trim() : '?');
    const en  = muscle.en  || (typeof muscle === 'string' ? (muscle.split('|')[1]||'').trim() : '');
    const url = muscle.url || 'https://www.instructor.co.il/';
    return `<a class="muscle-tag ${type}" href="${url}" target="_blank" rel="noopener">
      <span class="dot"></span>${he}${en ? ` <span style="opacity:.6;font-size:.7em">${en}</span>` : ''}</a>`;
  }

  const MUSCLE_LABELS = { primary: 'שרירים ראשיים', secondary: 'שרירים משניים', stabilizer: 'מייצבים' };

  function muscleSection(muscles, type) {
    if (!muscles?.length) return '';
    return `<div class="muscle-section mt-8">
      <div class="muscle-label">${MUSCLE_LABELS[type]||''}</div>
      <div class="muscle-tags">${muscles.map(m => muscleTag(m, type)).join('')}</div>
    </div>`;
  }

  // ── הוראות ────────────────────────────────────
  function stepItem({ num, action, detail }) {
    return `<li class="step">
      <div class="step-num">${num}</div>
      <div><div class="step-action">${action}</div><div class="step-detail">${detail}</div></div>
    </li>`;
  }

  function stepsList(steps) {
    if (!steps?.length) return '';
    return `<div class="section-title mt-8">הוראות ביצוע</div>
      <ul class="steps-list">${steps.map(stepItem).join('')}</ul>`;
  }

  // ── קופסאות ───────────────────────────────────
  const ALERT_ICONS = { warn: '⚠️', tip: '✅', info: '💡' };
  function alertBox(text, type) {
    if (!text) return '';
    return `<div class="alert-box ${type||'info'} mt-8">${ALERT_ICONS[type]||'💡'} <span>${text}</span></div>`;
  }

  // ── תגיות ─────────────────────────────────────
  const BADGE_STYLES = {
    purple: 'background:#EEEDFE;color:#3C3489',
    green:  'background:#E1F5EE;color:#085041',
    gray:   'background:#F5F5F5;color:#6B6B6B',
    orange: 'background:#FAEEDA;color:#633806'
  };
  function badge(text, color) {
    return `<span class="badge" style="${BADGE_STYLES[color||'purple']}">${text}</span>`;
  }

  // ── צבע לפי קטגוריית ציוד ─────────────────────
  const EQUIP_STYLE = {
    'מוט חופשי':      'background:#F0EEF9;color:#3C3489',
    'משקולות יד':     'background:#F0EEF9;color:#3C3489',
    'כבל פולי':       'background:#E1F5EE;color:#085041',
    'גומיה':           'background:#FFF3E0;color:#7C4700',
    'משקל גוף':       'background:#F5F5F5;color:#444',
    'מכונה ייעודית':  'background:#FCE4EC;color:#880E4F',
    'רצועות':         'background:#E8F5E9;color:#1B5E20'
  };

  function equipBadge(cat) {
    if (!cat) return '';
    var s = EQUIP_STYLE[cat] || 'background:#eee;color:#333';
    return '<span class="badge" style="' + s + '">🏷️ ' + cat + '</span>';
  }

  function areaBadges(areas) {
    if (!areas || !areas.length) return '';
    return areas.map(function(a) {
      return '<span class="badge" style="background:#EEEDFE;color:#3C3489">💪 ' + a + '</span>';
    }).join('');
  }

  // ── זיהוי תרגיל תזמון (פלאנק וכו') ───────────
  const TIMED_IDS = ['plank','side_plank','sus_side_plank','sus_crunch',
                     'sus_mountain_climber','sus_pendulum'];

  function isTimedExercise(ex) {
    return TIMED_IDS.includes(ex.id) || (ex.sets && ex.sets.includes('שניות'));
  }

  function timerWidget(ex) {
    // חלץ זמן ברירת מחדל מתוך "3 × 30–45 שניות"
    var match = (ex.sets || '').match(/(\d+)/g);
    var defaultSec = match && match.length >= 2 ? parseInt(match[1]) : 30;
    var uid = 'pt_' + ex.id;
    return `
      <div class="card" style="background:#F5F3FF;border:1.5px solid #EEEDFE;margin-top:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:1.4rem">⏱</div>
          <div style="flex:1">
            <div style="font-size:.8rem;font-weight:700;color:#3C3489">טיימר פלאנק</div>
            <div style="font-size:.7rem;color:#6B6B6B">ברירת מחדל: ${defaultSec} שניות</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <button onclick="PlankTimer.adj('${uid}',-5)"
              style="border:none;border-radius:8px;background:#EEEDFE;color:#3C3489;
                     font-weight:700;font-size:.85rem;padding:5px 10px;cursor:pointer">−5</button>
            <div id="${uid}_disp"
              style="font-size:1.8rem;font-weight:800;color:#3C3489;
                     font-variant-numeric:tabular-nums;min-width:52px;text-align:center">
              ${String(Math.floor(defaultSec/60)).padStart(1,'0')}:${String(defaultSec%60).padStart(2,'0')}
            </div>
            <button onclick="PlankTimer.adj('${uid}',5)"
              style="border:none;border-radius:8px;background:#EEEDFE;color:#3C3489;
                     font-weight:700;font-size:.85rem;padding:5px 10px;cursor:pointer">+5</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="${uid}_btn" onclick="PlankTimer.toggle('${uid}')"
            style="flex:1;border:none;border-radius:10px;background:#3C3489;color:#fff;
                   font-family:Heebo,sans-serif;font-weight:700;font-size:1rem;
                   padding:10px;cursor:pointer">▶ התחל</button>
          <button onclick="PlankTimer.reset('${uid}')"
            style="border:none;border-radius:10px;background:#EEEDFE;color:#3C3489;
                   font-family:Heebo,sans-serif;font-weight:700;font-size:1rem;
                   padding:10px 14px;cursor:pointer">↺</button>
        </div>
        <div id="${uid}_prog" style="height:4px;background:#EEEDFE;border-radius:4px;margin-top:8px;overflow:hidden">
          <div id="${uid}_bar" style="height:4px;background:#3C3489;width:100%;transition:width .9s linear,background .3s"></div>
        </div>
      </div>
      <script>window.__plankInit = window.__plankInit || [];
      window.__plankInit.push({uid:'${uid}',sec:${defaultSec}});</script>`;
  }

  // ── כרטיס תרגיל ───────────────────────────────
  function exerciseCard(ex, index) {
    const src = imgPath(ex.image);
    return `
      <div class="card exercise-card" id="ex-${ex.id}">
        <div class="ex-header">
          <div class="ex-num" style="background:#EEEDFE;color:#3C3489">${index + 1}</div>
          <div>
            <div class="ex-name-he">${ex.name_he}</div>
            <div class="ex-name-en">${ex.name_en}</div>
            <div class="ex-machine">📍 ${ex.machine}</div>
          </div>
        </div>

        <!-- ציוד + אזורי גוף -->
        <div class="badge-row" style="flex-wrap:wrap;gap:5px">
          ${equipBadge(ex.equipment_category)}
          ${areaBadges(ex.body_areas)}
        </div>

        <!-- סטים + מנוחה -->
        <div class="badge-row" style="margin-top:6px">
          ${badge('⚡ ' + ex.sets, 'purple')}
          ${badge('⏱ ' + ex.rest_sec + '″ מנוחה', 'gray')}
        </div>

        ${src ? `<img class="exercise-img mt-8" src="${src}" alt="${ex.name_en}"
          loading="lazy" onerror="this.style.display='none'">` : ''}
        <div class="divider mt-8"></div>
        ${muscleSection(ex.primary_muscles,   'primary')}
        ${muscleSection(ex.secondary_muscles, 'secondary')}
        ${muscleSection(ex.stabilizers,       'stabilizer')}
        <div class="divider mt-8"></div>
        ${stepsList(ex.steps)}
        ${alertBox(ex.motion, 'info')}
        ${alertBox(ex.warn,   'warn')}
        ${alertBox(ex.tip,    'tip')}
        <div class="divider mt-8"></div>
        ${isTimedExercise(ex) ? timerWidget(ex) : ''}
        <div class="set-logger mt-8" data-ex="${ex.id}" data-sets="${parseInt(ex.sets)||3}"></div>
        ${ex.instructor_url
          ? `<a href="${ex.instructor_url}" target="_blank" rel="noopener"
               class="btn-save mt-8"
               style="text-decoration:none;display:block;text-align:center;background:#085041">
               🔗 מידע נוסף — instructor.co.il</a>` : ''}
      </div>`;
  }

  // ── כרטיס יום ─────────────────────────────────
  const DAY_ICONS  = { strength: '🏋️', cardio: '🏃', rest: '😴' };
  const DAY_COLORS = { strength: 'purple', cardio: 'green', rest: 'gray' };
  const DAY_LABELS = {
    sunday:'ראשון', monday:'שני',   tuesday:'שלישי',
    wednesday:'רביעי', thursday:'חמישי', friday:'שישי', saturday:'שבת'
  };

  function dayCard(day, isToday, href) {
    const link  = href ?? day.page;
    const color = DAY_COLORS[day.type] || 'gray';
    const icon  = DAY_ICONS[day.type]  || '📅';
    return `<a class="day-card${isToday ? ' today' : ''}" href="${link}" data-day="${day.day}">
      <div class="day-dot ${color}">${icon}</div>
      <div class="day-info">
        <div class="day-label">${DAY_LABELS[day.day]} — ${day.label}</div>
        <div class="day-sub">${day.subtitle}</div>
      </div>
      <div class="day-arrow">←</div>
    </a>`;
  }

  function todayShortcut(dayPlan) {
    if (!dayPlan) return '';
    const icon = DAY_ICONS[dayPlan.type] || '📅';
    return `<div class="card">
      <div class="card-header">
        <div class="card-icon" style="font-size:1.6rem">${icon}</div>
        <div>
          <div class="card-title">${dayPlan.label}</div>
          <div class="card-subtitle">${dayPlan.subtitle}</div>
        </div>
      </div>
      <a href="${dayPlan.page}" class="btn-save"
         style="text-decoration:none;display:block;text-align:center">
        פתח אימון היום
      </a>
    </div>`;
  }

  function cardioZone(label, value, unit) {
    return `<div>
      <div class="zone-label">${label}</div>
      <div class="zone-val">${value}</div>
      <div class="zone-unit">${unit}</div>
    </div>`;
  }

  // ── בניית תפריט תרגילים ───────────────────────
  function buildExNav(nav, exercises, onSelect) {
    nav.innerHTML = '';
    const back = document.createElement('button');
    back.className = 'tab-btn';
    back.textContent = '← חזרה';
    back.onclick = () => history.back();
    nav.appendChild(back);

    exercises.forEach((ex, i) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = ex.name_he;
      btn.onclick = () => {
        nav.querySelectorAll('.tab-btn').forEach((b, j) => b.classList.toggle('active', j === i + 1));
        onSelect(i);
      };
      nav.appendChild(btn);
    });

    // הפעל ראשון
    setTimeout(() => {
      const btns = nav.querySelectorAll('.tab-btn');
      btns.forEach(b => b.classList.remove('active'));
      if (btns[1]) btns[1].classList.add('active');
    }, 0);
  }

  return {
    imgPath, muscleTag, muscleSection, stepItem, stepsList,
    alertBox, badge, exerciseCard, dayCard, todayShortcut,
    cardioZone, buildExNav
  };
})();
