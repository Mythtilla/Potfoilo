/* ============================================================
   BHASKAR — orchestrator
   Boots the character portrait, waves, reveals, transitions,
   audio and the mobile menu. Each concern lives in its own
   file; this one wires them to the page.
   ============================================================ */
(function (global) {
  'use strict';

  function ready(fn) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = global.document.querySelector('.menu-toggle');
    var panel = global.document.querySelector('.menu-panel');
    if (!toggle || !panel) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('open');
      global.document.body.classList.remove('menu-open');
    }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('open');
      global.document.body.classList.add('menu-open');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('open')) close();
      else {
        open();
        if (global.BH && global.BH.sound) global.BH.sound.play('click');
      }
    });

    global.document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    panel.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) close();
    });
  }

  function initPagetitle() {
    // nothing runtime-driven needed; titles are static in HTML
  }

  function renderProjectRows() {
    var host = global.document.querySelector('[data-project-rows]');
    if (!host || !global.BH_PROJECTS) return;

    Object.keys(global.BH_PROJECTS).forEach(function (k) {
      var p = global.BH_PROJECTS[k];
      if (!p || !p.url) return;

      var a = global.document.createElement('a');
      a.className = 'build-row';
      a.href = p.url;
      a.setAttribute('data-sound', 'click');
      a.setAttribute('data-reveal', '');

      var wm = global.document.createElement('span');
      wm.className = 'watermark';
      wm.textContent = p.num;

      var bnum = global.document.createElement('span');
      bnum.className = 'bnum mono';
      bnum.textContent = p.num;

      var bname = global.document.createElement('span');
      bname.className = 'bname';
      bname.textContent = p.name;

      var btag = global.document.createElement('span');
      btag.className = 'btag mono';
      btag.textContent = p.tag;

      var meta = global.document.createElement('div');
      meta.className = 'meta';
      [['Year', p.year], ['Status', p.status], ['Tech', p.tech]].forEach(function (pair) {
        var sp = global.document.createElement('span');
        var b = global.document.createElement('b');
        b.textContent = pair[0];
        sp.appendChild(b);
        sp.appendChild(global.document.createTextNode(pair[1]));
        meta.appendChild(sp);
      });

      var go = global.document.createElement('span');
      go.className = 'go caps';
      go.textContent = 'View project';
      var arrow = global.document.createElement('span');
      arrow.className = 'arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="none"><path d="M2 12 H21 M14 5 L21 12 L14 19"/></svg>';
      go.appendChild(global.document.createTextNode(' '));
      go.appendChild(arrow);

      a.appendChild(wm);
      a.appendChild(bnum);
      a.appendChild(bname);
      a.appendChild(btag);
      a.appendChild(meta);
      a.appendChild(go);
      host.appendChild(a);
    });
  }

  ready(function () {
    global.document.documentElement.classList.remove('no-js');
    if (global.BH.sound) global.BH.sound.wire();
    if (global.BH.transitions) global.BH.transitions.init();
    renderProjectRows();
    if (global.BH.reveal) global.BH.reveal.init();
    if (global.BH.waves) global.BH.waves.init();
    if (global.BH.portrait) global.BH.portrait.init();
    initMenu();
  });
})(window);