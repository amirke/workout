/**
 * components.js — אבני בניין של ממשק המשתמש
 * פונקציות טהורות שמחזירות מחרוזות HTML
 * אין state, אין side effects
 */

// ── תגיות שרירים ────────────────────────────────
const MUSCLE_CONFIG = {
  primary:    { cls: 'primary',    label: 'שרירים ראשיים' },
  secondary:  { cls: 'secondary',  label: 'שרירים משניים' },
  stabilizer: { cls: 'stabilizer', label: 'מייצבים' }
};

export function muscleTag(muscle, type = 'primary') {
  const he  = muscle.he  || (typeof muscle === 'string' ? muscle.split('|')[0].trim() : '?');
  const en  = muscle.en  || (typeof muscle === 'string' ? muscle.split('|')[1]?.trim() : '');
  const url = muscle.url || 'https://www.instructor.co.il/';
  return `<a class="muscle-tag ${type}" href="${url}" target="_blank" rel="noopener">
    <span class="dot"></span>${he}${en ? ` <span style="opacity:.6;font-size:.7em">${en}</span>` : ''}</a>`;
}

export function muscleSection(muscles, type) {
  if (!muscles?.length) return '';
  const cfg = MUSCLE_CONFIG[type] || MUSCLE_CONFIG.primary;
  return `
    <div class="muscle-section mt-8">
      <div class="muscle-label">${cfg.label}</div>
      <div class="muscle-tags">${muscles.map(m => muscleTag(m, type)).join('')}</div>
    </div>`;
}

// ── הוראות ──────────────────────────────────────
export function stepItem({ num, action, detail }) {
  return `<li class="step">
    <div class="step-num">${num}</div>
    <div>
      <div class="step-action">${action}</div>
      <div class="step-detail">${detail}</div>
    </div>
  </li>`;
}

export function stepsList(steps) {
  if (!steps?.length) return '';
  return `
    <div class="section-title mt-8">הוראות ביצוע</div>
    <ul class="steps-list">${steps.map(stepItem).join('')}</ul>`;
}

// ── קופסאות התראה ────────────────────────────────
const ALERT_ICONS = { warn: '⚠️', tip: '✅', info: '💡' };

export function alertBox(text, type = 'info') {
  if (!text) return '';
  return `<div class="alert-box ${type} mt-8">${ALERT_ICONS[type] || '💡'} <span>${text}</span></div>`;
}

// ── תגיות ────────────────────────────────────────
export function badge(text, color = 'purple') {
  const STYLES = {
    purple: 'background:#EEEDFE;color:#3C3489',
    green:  'background:#E1F5EE;color:#085041',
    gray:   'background:#F5F5F5;color:#6B6B6B',
    orange: 'background:#FAEEDA;color:#633806'
  };
  return `<span class="badge" style="${STYLES[color] || STYLES.purple}">${text}</span>`;
}

// ── כרטיס תרגיל (מלא) ───────────────────────────
export function exerciseCard(ex, index) {
  const imgSrc = ex.image || null;

  return `
    <div class="card exercise-card" id="ex-${ex.id}">

      <!-- כותרת -->
      <div class="ex-header">
        <div class="ex-num" style="background:#EEEDFE;color:#3C3489">${index + 1}</div>
        <div>
          <div class="ex-name-he">${ex.name_he}</div>
          <div class="ex-name-en">${ex.name_en}</div>
          <div class="ex-machine">📍 ${ex.machine}</div>
        </div>
      </div>

      <!-- תגיות -->
      <div class="badge-row">
        ${badge(`⚡ ${ex.sets}`, 'purple')}
        ${badge(`⏱ ${ex.rest_sec}″ מנוחה`, 'gray')}
      </div>

      <!-- תמונה -->
      ${imgSrc ? `<img class="exercise-img mt-8"
        src="${imgSrc}" alt="${ex.name_en}" loading="lazy"
        onerror="this.style.display='none'">` : ''}

      <div class="divider mt-8"></div>

      <!-- שרירים -->
      ${muscleSection(ex.primary_muscles,   'primary')}
      ${muscleSection(ex.secondary_muscles, 'secondary')}
      ${muscleSection(ex.stabilizers,       'stabilizer')}

      <div class="divider mt-8"></div>

      <!-- הוראות -->
      ${stepsList(ex.steps)}

      <!-- תיאור תנועה / אזהרה / טיפ -->
      ${alertBox(ex.motion, 'info')}
      ${alertBox(ex.warn,   'warn')}
      ${alertBox(ex.tip,    'tip')}

      <div class="divider mt-8"></div>

      <!-- לוג סטים (ימולא על ידי tracker.js) -->
      <div class="set-logger mt-8"
           data-ex="${ex.id}"
           data-sets="${parseInt(ex.sets) || 3}">
      </div>

      <!-- קישור Instructor -->
      ${ex.instructor_url
        ? `<a href="${ex.instructor_url}" target="_blank" rel="noopener"
              class="btn-save mt-8"
              style="text-decoration:none;display:block;text-align:center;background:#085041">
              🔗 מידע נוסף — instructor.co.il
           </a>`
        : ''}
    </div>`;
}

// ── כרטיס יום בלוח שבועי ────────────────────────
const DAY_ICONS  = { strength: '🏋️', cardio: '🏃', rest: '😴' };
const DAY_COLORS = { strength: 'purple', cardio: 'green', rest: 'gray' };
const DAY_LABELS = {
  sunday:'ראשון', monday:'שני',   tuesday:'שלישי',
  wednesday:'רביעי', thursday:'חמישי', friday:'שישי', saturday:'שבת'
};

export function dayCard(day, isToday = false, href = null) {
  const link  = href ?? day.page;
  const color = DAY_COLORS[day.type] || 'gray';
  const icon  = DAY_ICONS[day.type]  || '📅';
  return `
    <a class="day-card${isToday ? ' today' : ''}"
       href="${link}" data-day="${day.day}">
      <div class="day-dot ${color}">${icon}</div>
      <div class="day-info">
        <div class="day-label">${DAY_LABELS[day.day]} — ${day.label}</div>
        <div class="day-sub">${day.subtitle}</div>
      </div>
      <div class="day-arrow">←</div>
    </a>`;
}

// ── כרטיס ימי קרדיו / מנוחה (ב-dashboard) ───────
export function todayShortcut(dayPlan) {
  if (!dayPlan) return '';
  const icon  = DAY_ICONS[dayPlan.type]  || '📅';
  const color = DAY_COLORS[dayPlan.type] || 'gray';
  const link  = dayPlan.page;
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-icon" style="font-size:1.6rem">${icon}</div>
        <div>
          <div class="card-title">${dayPlan.label}</div>
          <div class="card-subtitle">${dayPlan.subtitle}</div>
        </div>
      </div>
      <a href="${link}" class="btn-save"
         style="text-decoration:none;display:block;text-align:center">
        פתח אימון היום
      </a>
    </div>`;
}

// ── כותרת לדף תרגיל ─────────────────────────────
export function pageHeader(icon, title, subtitle = '') {
  return `<div class="card" style="margin-bottom:12px">
    <div class="card-header">
      <div class="card-icon" style="font-size:1.6rem">${icon}</div>
      <div>
        <div class="card-title">${title}</div>
        ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ── כרטיס אזור קרדיו ────────────────────────────
export function cardioZone(label, value, unit) {
  return `<div>
    <div class="zone-label">${label}</div>
    <div class="zone-val">${value}</div>
    <div class="zone-unit">${unit}</div>
  </div>`;
}

// ── תפריט טאבים לתרגילים ─────────────────────────
export function buildExNav(nav, exercises, onSelect) {
  // כפתור חזרה
  const back = document.createElement('button');
  back.className = 'tab-btn active';
  back.textContent = '← חזרה';
  back.addEventListener('click', () => history.back());
  nav.appendChild(back);

  exercises.forEach((ex, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.textContent = ex.name_he;
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.tab-btn')
         .forEach((b, j) => b.classList.toggle('active', j === i + 1));
      onSelect(i);
    });
    nav.appendChild(btn);
  });

  // מפעיל את הראשון
  requestAnimationFrame(() => {
    const tabs = nav.querySelectorAll('.tab-btn');
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
  });
}
