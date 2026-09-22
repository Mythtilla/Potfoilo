/* ============================================================
   BHASKAR — canvas character portrait
   Sampled luminance becomes characters. Rendered once to an
   offscreen grid, then drawn in slowly-shifting horizontal
   strips — a quiet silver field that still reads as a face.

   Adapts density to viewport, pauses when offscreen or when
   the tab is hidden, and goes fully static under
   prefers-reduced-motion. Pure Canvas: no thousands of DOM
   nodes. The real image stays on the page as a fallback.
   ============================================================ */
(function (global) {
  'use strict';

  var RAMP = ' .:;=+*#%@'; // index 0 = brightest, 9 = darkest

  var states = [];
  var raf = null;

  function prefersReduced() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function build(canvas, img, frame) {
    var W = frame.clientWidth || canvas.parentNode.clientWidth || 640;
    var Hr = img.naturalHeight / img.naturalWidth;
    var H = Math.round(W * Hr);
    var dpr = Math.min(2, global.devicePixelRatio || 1);

    // adaptive density (fewer cells on small screens)
    var cols;
    if (W < 480) cols = 66;
    else if (W < 820) cols = 96;
    else cols = 148;

    var cellW = W / cols;
    var fs = cellW / 0.6;                 // mono glyph aspect ~0.6
    var rowH = fs * 1.12;
    var rows = Math.max(1, Math.floor(H / rowH));

    var gw = Math.ceil(cols * cellW);
    var gh = Math.ceil(rows * rowH);

    // 1) threshold sample of the image
    var smp = global.document.createElement('canvas');
    smp.width = cols;
    smp.height = rows;
    var smpCtx = smp.getContext('2d');
    smpCtx.drawImage(img, 0, 0, cols, rows);
    var data = smpCtx.getImageData(0, 0, cols, rows).data;

    // 2) glyph grid (offscreen, rendered once)
    var grid = global.document.createElement('canvas');
    grid.width = Math.ceil(gw * dpr);
    grid.height = Math.ceil(gh * dpr);
    var gctx = grid.getContext('2d');
    gctx.scale(dpr, dpr);
    gctx.font = fs + 'px "IBM Plex Mono", ui-monospace, monospace';
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var i = (r * cols + c) * 4;
        var l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        var idx = Math.min(RAMP.length - 1, Math.max(0, Math.round((1 - l / 255) * (RAMP.length - 1))));
        var ch = RAMP[idx];
        if (ch === ' ') continue;
        var t = 104 + Math.round(idx * 148 / (RAMP.length - 1));
        gctx.fillStyle = 'rgb(' + t + ',' + t + ',' + Math.min(255, t + 10) + ')';
        gctx.fillText(ch, (c + 0.5) * cellW, (r + 0.5) * rowH + fs * 0.04);
      }
    }

    // 3) visible canvas
    canvas.width = Math.ceil(gw * dpr);
    canvas.height = Math.ceil(gh * dpr);
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    return {
      grid: grid,
      ctx: ctx,
      W: gw,
      H: gh,
      strip: Math.max(6, Math.round(fs * 1.4)),
      amp: Math.min(7, Math.max(2, fs * 0.55)),
      jitter: fs * 0.14,
      phase: 0,
      pointer: { x: 0.5, y: 0.5, on: false },
      canvas: canvas,
      reduced: false,
      visible: false
    };
  }

  function draw(s, now) {
    if (s.reduced) { drawStatic(s); return; }
    var t = now * 0.000085 + s.phase;
    var ctx = s.ctx;
    ctx.clearRect(0, 0, s.W, s.H);

    var strips = Math.ceil(s.H / s.strip);
    for (var i = 0; i < strips; i++) {
      var y = i * s.strip;
      var amp = s.amp;
      if (s.pointer.on) {
        var pc = s.pointer.y;
        var dist = Math.abs((i / strips) - pc);
        amp += Math.max(0, 1 - dist * 4) * s.amp * 0.7;
      }
      var sway = Math.sin(t + i * 0.2) * amp * 0.5 + Math.sin(t * 0.7 + i * 0.13) * amp * 0.5;
      var jit = (Math.sin(t * 0.6 + i * 0.9) * 0.5 + 0.5) * s.jitter;
      var dy = Math.round(sway + jit);
      ctx.drawImage(s.grid, dy, y, s.W, s.strip, 0, y, s.W, s.strip);
    }
  }

  function drawStatic(s) {
    s.ctx.clearRect(0, 0, s.W, s.H);
    s.ctx.drawImage(s.grid, 0, 0, s.W, s.H);
  }

  function loop(now) {
    var active = false;
    for (var i = 0; i < states.length; i++) {
      var s = states[i];
      if (s.reduced) continue;
      if (s.visible && !global.document.hidden) {
        draw(s, now);
        active = true;
      }
    }
    raf = active ? requestAnimationFrame(loop) : null;
  }

  function kick() {
    if (raf) return;
    raf = requestAnimationFrame(loop);
  }

  function attach(canvas) {
    var src = canvas.getAttribute('data-src');
    var frame = canvas.parentNode;
    var fallbackId = canvas.getAttribute('data-fallback');
    var reduced = prefersReduced();

    var img = new Image();
    img.decoding = 'async';

    img.onload = function () {
      var s = build(canvas, img, frame);
      s.reduced = reduced;

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          s.visible = entry.isIntersecting;
          if (s.visible && !s.reduced) kick();
        });
      }, { threshold: 0, rootMargin: '80px' });
      io.observe(frame);

      var pointer = s.pointer;
      canvas.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = (e.clientY - r.top) / r.height;
        pointer.on = true;
      });
      canvas.addEventListener('pointerleave', function () { pointer.on = false; });
      canvas.addEventListener('touchstart', function () { pointer.on = false; }, { passive: true });

      canvas.classList.add('is-ready');
      states.push(s);

      if (!reduced) kick();
      else drawStatic(s);
    };

    img.onerror = function () {
      canvas.classList.add('is-broken');
      if (fallbackId) {
        var fb = global.document.getElementById(fallbackId);
        if (fb) { fb.removeAttribute('hidden'); fb.removeAttribute('loading'); }
      }
    };

    img.src = src;
  }

  function init() {
    var canvases = global.document.querySelectorAll('canvas[data-portrait]');
    Array.prototype.forEach.call(canvases, attach);

    global.document.addEventListener('visibilitychange', function () {
      if (!global.document.hidden) kick();
    });
  }

  global.BH = global.BH || {};
  global.BH.portrait = { init: init };
})(window);