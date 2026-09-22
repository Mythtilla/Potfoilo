/* ============================================================
   BHASKAR — audio manager
   Sound is OFF by default. The user opts in; the choice is kept
   in localStorage. Every failure is silent on purpose.
   ============================================================ */
(function (global) {
  'use strict';

  var KEY = 'bhaskar:sound';
  var VOLUME = 0.5;

  var FILES = {
    click: 'assets/audio/ui-click.mp3',
    metal: 'assets/audio/ui-metal.mp3',
    whoosh: 'assets/audio/soft-whoosh.mp3',
    chime: 'assets/audio/page-chime.mp3'
  };

  var pool = {};
  var enabled = false;
  var built = false;

  function base() {
    var el = global.document.documentElement;
    return (el && el.getAttribute('data-base')) || '';
  }
  function res(p) { return base() + p; }

  function build() {
    if (built) return;
    built = true;
    Object.keys(FILES).forEach(function (k) {
      try {
        var a = new Audio(res(FILES[k]));
        a.preload = 'auto';
        a.volume = VOLUME;
        pool[k] = a;
      } catch (e) { pool[k] = null; }
    });
  }

  function play(name) {
    if (!enabled) return;
    var a = pool[name];
    if (!a) return;
    try {
      a.currentTime = 0;
      var p = a.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) { /* never break the page for a sound */ }
  }

  function loadState() {
    try {
      enabled = (global.localStorage.getItem(KEY) === 'on');
    } catch (e) { enabled = false; }
  }

  function saveState() {
    try {
      global.localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch (e) { /* localStorage unavailable — fine */ }
  }

  function isOn() { return enabled; }

  function set(v) {
    enabled = !!v;
    saveState();
    syncToggles();
    if (enabled) build();
  }

  function toggle() {
    set(!enabled);
    build();
    play('metal');
    return enabled;
  }

  function syncToggles() {
    var els = global.document.querySelectorAll('[data-sound-toggle]');
    Array.prototype.forEach.call(els, function (btn) {
      btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      var label = btn.querySelector('[data-sound-label]');
      if (label) label.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    });
  }

  function wire() {
    var els = global.document.querySelectorAll('[data-sound-toggle]');
    Array.prototype.forEach.call(els, function (btn) {
      btn.addEventListener('click', toggle);
    });

    global.document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-sound]') : null;
      if (!t) return;
      play(t.getAttribute('data-sound') || 'click');
    });
  }

  global.BH = global.BH || {};
  global.BH.sound = {
    play: play,
    set: set,
    toggle: toggle,
    isOn: isOn,
    wire: wire
  };

  loadState();
  if (enabled) build();
  syncToggles();
})(window);