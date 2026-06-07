/**
 * planktimer.js — טיימר מוטמע לתרגילי פלאנק
 * חושף: window.PlankTimer
 */
window.PlankTimer = (function() {
  var timers = {}; // uid → {duration, remaining, running, tick}

  function fmt(s) {
    s = Math.max(0, s);
    return Math.floor(s/60) + ':' + ('0' + s%60).slice(-2);
  }

  function beep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(function(t) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(t===0.5?1174:880, ctx.currentTime+t);
        g.gain.setValueAtTime(0.4, ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+t+0.22);
        o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+0.25);
      });
    } catch(e) {}
  }

  function paint(uid) {
    var t = timers[uid]; if (!t) return;
    var disp = document.getElementById(uid+'_disp');
    var bar  = document.getElementById(uid+'_bar');
    var btn  = document.getElementById(uid+'_btn');
    var p = t.duration > 0 ? t.remaining / t.duration : 1;
    var col = p < 0.2 ? '#E53935' : p < 0.5 ? '#FB8C00' : '#3C3489';
    if (disp) { disp.textContent = fmt(t.remaining); disp.style.color = col; }
    if (bar)  { bar.style.width = (p*100)+'%'; bar.style.background = col; }
    if (btn)  btn.textContent = t.running ? '⏸ עצור' : '▶ התחל';
  }

  function init(uid, sec) {
    if (timers[uid]) return;
    timers[uid] = { duration: sec, remaining: sec, running: false, tick: null };
    paint(uid);
  }

  function toggle(uid) {
    var t = timers[uid]; if (!t) return;
    if (t.running) {
      clearInterval(t.tick); t.running = false; paint(uid);
    } else {
      if (t.remaining <= 0) { t.remaining = t.duration; }
      t.running = true;
      t.tick = setInterval(function() {
        t.remaining--;
        paint(uid);
        if (t.remaining <= 0) {
          clearInterval(t.tick); t.running = false;
          paint(uid); beep();
        }
      }, 1000);
      paint(uid);
    }
  }

  function reset(uid) {
    var t = timers[uid]; if (!t) return;
    clearInterval(t.tick); t.running = false;
    t.remaining = t.duration; paint(uid);
  }

  function adj(uid, delta) {
    var t = timers[uid]; if (!t) return;
    if (t.running) return;
    t.duration  = Math.max(5, Math.min(600, t.duration + delta));
    t.remaining = t.duration;
    paint(uid);
  }

  // אתחול כל הטיימרים שהוגדרו בדף
  function initAll() {
    if (!window.__plankInit) return;
    window.__plankInit.forEach(function(p) { init(p.uid, p.sec); });
    window.__plankInit = [];
  }

  // מאזין לשינויי DOM (כשמוחלפים תרגילים)
  var _obs = new MutationObserver(function() { initAll(); });
  document.addEventListener('DOMContentLoaded', function() {
    _obs.observe(document.body, { childList: true, subtree: true });
    initAll();
  });

  return { init: init, toggle: toggle, reset: reset, adj: adj };
})();
