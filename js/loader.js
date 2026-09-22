/* ============================================================
   BHASKAR — preloader
   The loading page: visible from first paint, then released.
   Shows once per session (sessionStorage), skipped under
   prefers-reduced-motion, and never blocks a page without JS.
   ============================================================ */
(function (global) {
  'use strict';

  var LOADED_KEY = 'bhaskar:loaded';
  var MIN_MS = 700;          // shortest time the loader may stay
  var MAX_MS = 2600;         // hard cap if the load event stalls

  var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hide(el) {
    el.classList.add('done');
    el.setAttribute('aria-hidden', 'true');
    global.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }

  function boot() {
    var el = global.document.querySelector('.loader');
    if (!el) return;

    var session = null;
    try { session = global.sessionStorage.getItem(LOADED_KEY); } catch (e) { /* ignore */ }

    // Already seen once this session, or reduced motion: never show the wait.
    if (reduced || session === '1') { hide(el); return; }

    var started = Date.now();
    var released = false;

    function done() {
      if (released) return;
      released = true;
      try { global.sessionStorage.setItem(LOADED_KEY, '1'); } catch (e) { /* ignore */ }
      hide(el);
    }

    function releaseSoon() {
      var elapsed = Date.now() - started;
      global.setTimeout(done, Math.max(0, MIN_MS - elapsed));
    }

    if (global.document.readyState === 'complete') releaseSoon();
    else global.addEventListener('load', releaseSoon);

    global.setTimeout(done, MAX_MS); // hard cap, assets always win
  }

  if (global.document.readyState === 'loading') {
    global.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);