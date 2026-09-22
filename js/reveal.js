/* ============================================================
   BHASKAR — scroll reveal
   Quiet fade/rise for elements marked with [data-reveal].
   ============================================================ */
(function (global) {
  'use strict';

  function init() {
    var els = global.document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      Array.prototype.forEach.call(els, function (el) {
        el.classList.add('in');
        el.setAttribute('data-revealed', '');
      });
      return;
    }

    if (!('IntersectionObserver' in global)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
      return;
    }

    Array.prototype.forEach.call(els, function (el) { el.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  global.BH = global.BH || {};
  global.BH.reveal = { init: init };
})(window);