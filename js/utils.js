/**
 * utils.js — WakeLock + Timer
 * חושף: window.Utils
 */
window.Utils = (function() {

  // ══════════════════════════════════════
  //  WAKE LOCK
  // ══════════════════════════════════════
  var _sentinel  = null;
  var _wlActive  = false;
  var _supported = ('wakeLock' in navigator);

  function updateWLBtn() {
    var btn = document.getElementById('wlBtn');
    if (!btn) return;
    if (!_supported) { btn.title = 'לא נתמך בדפדפן זה'; btn.style.opacity = '.4'; return; }
    btn.textContent  = _wlActive ? '☀️' : '🌙';
    btn.title        = _wlActive ? 'מסך דלוק — לחץ לכיבוי' : 'מסך יכבה — לחץ להשאיר דלוק';
    btn.style.background = _wlActive ? 'rgba(255,210,0,.28)' : 'transparent';
  }

  async function wlOn() {
    if (!_supported) return;
    try {
      _sentinel = await navigator.wakeLock.request('screen');
      _sentinel.addEventListener('release', function() { _wlActive = false; updateWLBtn(); });
      _wlActive = true;
      updateWLBtn();
    } catch(e) { console.warn('WakeLock:', e.message); }
  }

  function wlOff() {
    if (_sentinel) { try { _sentinel.release(); } catch(e){} _sentinel = null; }
    _wlActive = false;
    updateWLBtn();
  }

  function toggleWakeLock() { _wlActive ? wlOff() : wlOn(); }

  // Re-acquire after screen comes back
  document.addEventListener('visibilitychange', function() {
    if (_wlActive && document.visibilityState === 'visible') wlOn();
  });

  // ══════════════════════════════════════
  //  TIMER
  // ══════════════════════════════════════
  var _duration  = 60;   // total seconds set
  var _remaining = 60;   // seconds left
  var _running   = false;
  var _tick      = null;

  // ── beep at end ──────────────────────
  function beep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(function(t) {
        var osc = ctx.createOscillator();
        var g   = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.setValueAtTime(t === 0.5 ? 1174 : 880, ctx.currentTime + t);
        g.gain.setValueAtTime(0.4, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.22);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.25);
      });
    } catch(e) {}
  }

  // ── helpers ──────────────────────────
  function fmt(sec) {
    sec = Math.max(0, sec);
    return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
  }

  function pct() { return _duration > 0 ? (_remaining / _duration) : 1; }

  function paint() {
    var disp  = document.getElementById('tmrDisplay');
    var total = document.getElementById('tmrTotal');
    var arc   = document.getElementById('tmrArc');
    var sBtn  = document.getElementById('tmrStart');
    var bar   = document.getElementById('timerBar');

    var timeStr = fmt(_remaining);
    var p   = pct();
    var col = p < 0.2 ? '#ff4444' : p < 0.5 ? '#ffaa00' : '#4ade80';

    // תצוגת זמן גדולה
    if (disp)  { disp.textContent = timeStr; disp.style.color = col; }
    if (total) total.textContent  = fmt(_duration);

    // כפתור הפעלה
    if (sBtn)  sBtn.textContent = _running ? '⏸' : '▶';

    // progress bar
    var prog = document.getElementById('tmrProgress');
    if (prog) {
      prog.style.width = (p * 100) + '%';
      prog.style.background = col;
    }

    // גבול עליון צבעוני בזמן ריצה
    if (bar) bar.style.borderTopColor = _running ? col : 'rgba(255,255,255,.08)';
  }

  function startTimer() {
    if (_running || _remaining <= 0) return;
    _running = true;
    paint();
    _tick = setInterval(function() {
      _remaining--;
      paint();
      if (_remaining <= 0) {
        clearInterval(_tick);
        _running = false;
        paint();
        beep();
      }
    }, 1000);
  }

  function stopTimer() {
    _running = false;
    if (_tick) { clearInterval(_tick); _tick = null; }
    paint();
  }

  function toggleTimer() { _running ? stopTimer() : startTimer(); }

  function resetTimer() {
    stopTimer();
    _remaining = _duration;
    paint();
  }

  function adjustDuration(delta) {
    stopTimer();
    _duration  = Math.max(5, Math.min(3600, _duration + delta));
    _remaining = _duration;
    paint();
  }

  // ── render bottom bar — גדול ויפה ──────────
  function renderTimerBar() {
    if (document.getElementById('timerBar')) return;

    var bar = document.createElement('div');
    bar.id = 'timerBar';
    bar.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:300;' +
      'background:#1c1c1a;border-top:2px solid rgba(255,255,255,.08);' +
      'font-family:Heebo,sans-serif;direction:rtl;user-select:none';

    var b  = 'border:none;border-radius:8px;cursor:pointer;font-weight:700;' +
             'padding:6px 14px;font-size:.82rem;background:rgba(255,255,255,.13);color:#fff';
    var bm = 'border:none;border-radius:8px;cursor:pointer;font-weight:700;' +
             'padding:6px 22px;font-size:1rem;background:#3C3489;color:#fff';
    var bw = 'border:none;cursor:pointer;font-size:.95rem;background:transparent;color:rgba(255,255,255,.5);padding:6px 8px';
    var pb = 'calc(8px + env(safe-area-inset-bottom,0px))';

    bar.innerHTML =
      // Progress bar
      '<div style="height:3px;background:rgba(255,255,255,.07)">' +
        '<div id="tmrProgress" style="height:3px;width:100%;background:#4ade80;transition:width .9s linear,background .3s"></div>' +
      '</div>' +
      // שורה 1 — תצוגת זמן גדולה
      '<div style="text-align:center;padding:8px 12px 4px">' +
        '<div id="tmrDisplay" style="font-size:2.2rem;font-weight:800;color:#4ade80;' +
             'font-variant-numeric:tabular-nums;letter-spacing:.04em;line-height:1">1:00</div>' +
        '<div id="tmrTotal" style="font-size:.6rem;color:rgba(255,255,255,.3);margin-top:2px">סה״כ 1:00</div>' +
      '</div>' +
      // שורה 2 — כפתורי שליטה
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;' +
           'padding:4px 12px;padding-bottom:' + pb + '">' +
        '<button onclick="Utils.adjustDuration(-10)" style="' + b + '">−10</button>' +
        '<button id="tmrStart" onclick="Utils.toggleTimer()"    style="' + bm + '">▶</button>' +
        '<button onclick="Utils.resetTimer()"                   style="' + b  + '">↺</button>' +
        '<button onclick="Utils.adjustDuration(10)"             style="' + b  + '">+10</button>' +
        '<button id="wlBtn"   onclick="Utils.toggleWakeLock()"  style="' + bw + '" title="מסך דלוק">🌙</button>' +
      '</div>';

    document.body.appendChild(bar);

    // padding מינימלי — רק לפי הגובה האמיתי
    requestAnimationFrame(function() {
      var h = bar.getBoundingClientRect().height;
      var main = document.querySelector('main');
      if (main) main.style.paddingBottom = h + 'px';
    });

    paint();
    updateWLBtn();
  }

  function btnStyle(type) {
    var base = 'border:none;border-radius:8px;cursor:pointer;font-family:Heebo,sans-serif;font-weight:700;font-size:.8rem;transition:background .15s;';
    if (type === 'main') return base + 'padding:7px 18px;background:#3C3489;color:#fff;font-size:1rem';
    if (type === 'wl')   return base + 'padding:7px 10px;background:transparent;color:#fff;font-size:1rem';
    return base + 'padding:6px 10px;background:rgba(255,255,255,.1);color:#fff';
  }

  return {
    toggleWakeLock,
    toggleTimer, startTimer, stopTimer, resetTimer, adjustDuration,
    renderTimerBar
  };
})();
