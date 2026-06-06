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

    if (disp)  disp.textContent  = fmt(_remaining);
    if (total) total.textContent = fmt(_duration);
    if (sBtn)  sBtn.textContent  = _running ? '⏸' : '▶';

    // colour: green → yellow → red
    var p = pct();
    var hue = Math.round(p * 120);   // 120=green, 0=red
    var colour = 'hsl(' + hue + ',80%,55%)';
    if (disp) disp.style.color = p < 0.2 ? '#ff4444' : '#fff';

    // SVG progress arc
    if (arc) {
      var r = 28, circ = 2 * Math.PI * r;
      arc.style.strokeDasharray  = circ;
      arc.style.strokeDashoffset = circ * (1 - p);
      arc.style.stroke = colour;
    }

    if (bar) bar.style.borderTopColor = _running ? colour : 'transparent';
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

  // ── render bottom bar ────────────────
  function renderTimerBar() {
    if (document.getElementById('timerBar')) return;  // already rendered

    var bar = document.createElement('div');
    bar.id = 'timerBar';
    bar.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:300',
      'background:#1e1e1c', 'border-top:2px solid transparent',
      'padding:10px 14px 14px',
      'display:flex', 'align-items:center', 'gap:10px',
      'box-shadow:0 -4px 20px rgba(0,0,0,.4)',
      'font-family:Heebo,sans-serif', 'direction:rtl'
    ].join(';');

    // SVG circle
    var r = 28, circ = (2 * Math.PI * r).toFixed(1);
    var svgSize = 72;
    var cx = svgSize / 2;

    bar.innerHTML = [
      // Circle + time
      '<div style="position:relative;flex-shrink:0">',
        '<svg width="' + svgSize + '" height="' + svgSize + '" style="transform:rotate(-90deg)">',
          '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="4"/>',
          '<circle id="tmrArc" cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="#4ade80" stroke-width="4"',
            ' stroke-linecap="round" style="stroke-dasharray:' + circ + ';stroke-dashoffset:0;transition:stroke-dashoffset .9s linear"/>',
        '</svg>',
        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">',
          '<div id="tmrDisplay" style="font-size:1.05rem;font-weight:800;color:#fff;line-height:1;font-variant-numeric:tabular-nums">1:00</div>',
        '</div>',
      '</div>',

      // Controls
      '<div style="flex:1;display:flex;flex-direction:column;gap:6px">',

        // Duration row
        '<div style="display:flex;align-items:center;gap:6px">',
          '<button onclick="Utils.adjustDuration(-10)" style="' + btnStyle() + '">−10s</button>',
          '<div style="flex:1;text-align:center;font-size:.72rem;color:rgba(255,255,255,.55)">סה&quot;כ <span id="tmrTotal">1:00</span></div>',
          '<button onclick="Utils.adjustDuration(10)"  style="' + btnStyle() + '">+10s</button>',
        '</div>',

        // Action row
        '<div style="display:flex;align-items:center;gap:6px">',
          '<button onclick="Utils.adjustDuration(-30)" style="' + btnStyle() + '">−30s</button>',
          '<button id="tmrStart" onclick="Utils.toggleTimer()" style="' + btnStyle('main') + '">▶</button>',
          '<button onclick="Utils.resetTimer()"        style="' + btnStyle() + '">↺</button>',
          '<button id="wlBtn"    onclick="Utils.toggleWakeLock()" style="' + btnStyle('wl') + '" title="מסך דלוק">🌙</button>',
        '</div>',

      '</div>'
    ].join('');

    document.body.appendChild(bar);
    document.body.style.paddingBottom = '110px';
    paint();
    updateWLBtn();
  }

  function btnStyle(type) {
    var base = [
      'border:none', 'border-radius:8px', 'cursor:pointer',
      'font-family:Heebo,sans-serif', 'font-weight:700',
      'font-size:.8rem', 'transition:background .15s'
    ].join(';');
    if (type === 'main') return base + ';padding:7px 18px;background:#3C3489;color:#fff;font-size:1rem';
    if (type === 'wl')   return base + ';padding:7px 10px;background:transparent;color:#fff;font-size:1rem';
    return base + ';padding:6px 10px;background:rgba(255,255,255,.1);color:#fff';
  }

  return {
    toggleWakeLock,
    toggleTimer, startTimer, stopTimer, resetTimer, adjustDuration,
    renderTimerBar
  };
})();
