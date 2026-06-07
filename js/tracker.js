/**
 * tracker.js — לוג אימונים ב-localStorage (ללא ES modules)
 * חושף: window.Tracker
 *
 * מפתחות: wlog_YYYY-MM-DD_exerciseId
 * נשמר לנצח בדפדפן — לא נמחק בעדכוני אפליקציה.
 */
window.Tracker = (() => {
  const PREFIX = 'wlog_';

  function dateKey(d) {
    return (d || new Date()).toISOString().slice(0, 10);
  }

  function storageKey(exId, date) {
    return PREFIX + (date || dateKey()) + '_' + exId;
  }

  function saveSets(exId, sets, date) {
    localStorage.setItem(storageKey(exId, date), JSON.stringify(sets));
  }

  function loadSets(exId, date) {
    const raw = localStorage.getItem(storageKey(exId, date));
    return raw ? JSON.parse(raw) : [];
  }

  // מצא את הפעם האחרונה שתרגיל זה בוצע (כל תאריך)
  function loadLastSession(exId) {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.endsWith('_' + exId) && k.startsWith(PREFIX)) {
        // חלץ תאריך מהמפתח
        var datePart = k.slice(PREFIX.length, PREFIX.length + 10);
        if (datePart !== dateKey()) keys.push({ key: k, date: datePart });
      }
    }
    if (!keys.length) return null;
    // מיין לפי תאריך — הכי חדש ראשון
    keys.sort(function(a, b) { return b.date.localeCompare(a.date); });
    var raw = localStorage.getItem(keys[0].key);
    return raw ? { date: keys[0].date, sets: JSON.parse(raw) } : null;
  }

  // כל הדאטות שבוצע בהן תרגיל
  function allSessionDates(exId) {
    var dates = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.endsWith('_' + exId) && k.startsWith(PREFIX)) {
        dates.push(k.slice(PREFIX.length, PREFIX.length + 10));
      }
    }
    return dates.sort().reverse();
  }

  function fmtDate(iso) {
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1]; // DD/MM
  }

  function renderSetLogger(container, exId, numSets) {
    numSets = numSets || 3;
    var today  = loadSets(exId);          // נתוני היום
    var last   = loadLastSession(exId);   // פעם אחרונה (אם אין היום)
    var hasToday = today.length > 0 && today.some(function(s) { return s.weight || s.reps; });
    var ref    = hasToday ? today : (last ? last.sets : []);
    var isLast = !hasToday && !!last;

    var html = '<div class="section-title">רישום סטים</div>';

    // תגית "פעם אחרונה" אם מציגים נתוני עבר
    if (isLast) {
      html += '<div style="font-size:.72rem;color:#6B6B6B;margin-bottom:6px;display:flex;align-items:center;gap:6px">' +
              '<span style="background:#FFF8E1;color:#F57F17;padding:2px 8px;border-radius:20px;font-weight:600">📅 פעם אחרונה: ' + fmtDate(last.date) + '</span>' +
              '<span>השלם ושמור להיום</span></div>';
    } else if (hasToday) {
      html += '<div style="font-size:.72rem;color:#085041;margin-bottom:6px">' +
              '✅ נשמר היום</div>';
    }

    for (var i = 0; i < numSets; i++) {
      var s = ref[i] || {};
      var placeholder_w = isLast ? (s.weight || '') : '';
      var placeholder_r = isLast ? (s.reps  || '') : '';
      var val_w = hasToday ? (s.weight || '') : '';
      var val_r = hasToday ? (s.reps  || '') : '';

      html += '<div class="set-log">' +
        '<span class="set-label">סט ' + (i + 1) + '</span>' +
        '<input type="number" min="0" step="0.5"' +
          ' placeholder="' + (placeholder_w || 'ק"ג') + '"' +
          ' value="' + val_w + '"' +
          ' data-field="weight" data-set="' + i + '">' +
        '<input type="number" min="0"' +
          ' placeholder="' + (placeholder_r || 'חזרות') + '"' +
          ' value="' + val_r + '"' +
          ' data-field="reps" data-set="' + i + '">' +
        '</div>';
    }

    // הערה לתרגיל
    var noteKey  = 'note_' + dateKey() + '_' + exId;
    var noteVal  = localStorage.getItem(noteKey) || '';
    html += '<textarea id="note_' + exId + '"' +
            ' placeholder="הערה לתרגיל (אופציונלי)..."' +
            ' style="width:100%;margin-top:8px;padding:8px 10px;border-radius:10px;' +
            'border:1.5px solid #EEEDFE;font-family:Heebo,sans-serif;font-size:.82rem;' +
            'direction:rtl;resize:vertical;min-height:52px;box-sizing:border-box;color:#333">' +
            noteVal + '</textarea>';

    html += '<button class="btn-save" data-ex="' + exId + '" style="margin-top:6px">שמור סטים + הערה</button>';

    // היסטוריה קצרה
    var dates = allSessionDates(exId);
    if (dates.length) {
      html += '<div style="margin-top:10px;font-size:.7rem;color:#6B6B6B">' +
              '📋 אימונים קודמים: ' +
              dates.slice(0, 5).map(function(d) {
                var s = loadSets(exId, d);
                var best = s.reduce(function(mx, x) { return Math.max(mx, x.weight || 0); }, 0);
                return '<span style="margin-left:8px">' + fmtDate(d) +
                       (best ? ' (' + best + 'ק"ג)' : '') + '</span>';
              }).join('') +
              '</div>';
    }

    container.innerHTML = html;

    container.querySelector('.btn-save').onclick = function() {
      var sets = [];
      for (var i = 0; i < numSets; i++) {
        var w = container.querySelector('input[data-set="' + i + '"][data-field="weight"]').value;
        var r = container.querySelector('input[data-set="' + i + '"][data-field="reps"]').value;
        sets.push({ set: i + 1, weight: parseFloat(w) || 0, reps: parseInt(r) || 0 });
      }
      saveSets(exId, sets);
      // שמור הערה
      var noteEl = container.querySelector('#note_' + exId);
      if (noteEl && noteEl.value.trim()) {
        localStorage.setItem('note_' + dateKey() + '_' + exId, noteEl.value.trim());
      }
      var btn = container.querySelector('.btn-save');
      btn.textContent = 'נשמר ✓';
      var tag = container.querySelector('[style*="פעם אחרונה"]');
      if (tag) tag.outerHTML = '<div style="font-size:.72rem;color:#085041;margin-bottom:6px">✅ נשמר היום</div>';
      setTimeout(function() { btn.textContent = 'שמור סטים + הערה'; }, 1500);
    };
  }

  return { saveSets, loadSets, loadLastSession, allSessionDates, renderSetLogger };
})();
