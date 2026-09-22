/* ============================================================
   BHASKAR — page transitions
   A short silver-haired wipe between internal pages.
   Native behaviour is preserved for modified clicks, middle
   clicks, open-in-new-tab etc. Respects prefers-reduced-motion.
   ============================================================ */
(function (global) {
  'use strict';

  var DURATION = 400;

  function isInternal(href) {
    var url;
    try { url = new URL(href, global.location.href); }
    catch (e) { return false; }
    if (url.origin !== global.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'file:') return false;
    if (url.hash && url.pathname === global.location.pathname) return false;
    return true;
  }

  function reducedMotion() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function onNavClick(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-nofx')) return;
    if (!isInternal(a.href)) return;

    e.preventDefault();

    if (reducedMotion()) {
      global.location.href = a.href;
      return;
    }

    if (global.BH && global.BH.sound) global.BH.sound.play('whoosh');
    global.document.body.classList.add('is-leaving');
    global.setTimeout(function () {
      global.location.href = a.href;
    }, DURATION);
  }

  function init() {
    global.document.addEventListener('click', onNavClick);

    // arrival: reveal the page from behind the shade
    global.document.body.classList.add('is-arriving');
    global.document.body.classList.add('is-live');
    global.setTimeout(function () {
      global.document.body.classList.remove('is-arriving');
    }, 900);

    if (global.BH && global.BH.sound) global.BH.sound.play('chime');
  }

  global.BH = global.BH || {};
  global.BH.transitions = { init: init };
})(window);