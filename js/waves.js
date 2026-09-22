/* ============================================================
   BHASKAR — wave system
   Thin slow silver lines drawn in SVG, animated with rAF.
   Each <svg data-wave> becomes a gentle moving line.
   Pauses when offscreen or under reduced motion; renders a
   static curve otherwise.
   ============================================================ */
(function (global) {
  'use strict';

  var instances = [];
  var running = false;

  function prefersReduced() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function buildPath(svg) {
    var W = 1600, H = 120;
    var amp = parseFloat(svg.getAttribute('data-amp') || '10');
    var freq = parseFloat(svg.getAttribute('data-freq') || '0.9');
    var seg = parseInt(svg.getAttribute('data-seg') || '60', 10);
    var fill = svg.getAttribute('data-fill') === 'true';
    var phase = parseFloat(svg.getAttribute('data-phase') || '0');
    var speed = parseFloat(svg.getAttribute('data-speed') || '0.00006');
    var mid = H / 2;

    var pts = [];
    for (var i = 0; i <= seg; i++) {
      var x = (W / seg) * i;
      var y = mid + Math.sin(phase + x * (freq * Math.PI * 2) / W) * amp;
      pts.push([x, y]);
    }

    var d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (var j = 1; j < pts.length; j++) {
      var c1x = (pts[j - 1][0] + pts[j][0]) / 2;
      var c1y = pts[j - 1][1];
      var c2x = c1x;
      var c2y = pts[j][1];
      d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + pts[j][0] + ' ' + pts[j][1];
    }

    if (fill) {
      d += ' L ' + W + ' ' + H + ' L 0 ' + H + ' Z';
    }

    var path = svg.querySelector('path');
    if (!path) {
      path = global.document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(path);
    }
    path.setAttribute('d', d);

    return {
      svg: svg,
      path: path,
      seg: seg,
      W: W,
      mid: mid,
      amp: amp,
      freq: freq,
      speed: speed,
      phase: phase,
      fill: fill
    };
  }

  function frame(now) {
    for (var i = 0; i < instances.length; i++) {
      var w = instances[i];
      if (!w.visible) continue;
      var t = now * w.speed;
      w.phase = t;
      var pts = [];
      for (var j = 0; j <= w.seg; j++) {
        var x = (w.W / w.seg) * j;
        var y = w.mid + Math.sin(t + x * (w.freq * Math.PI * 2) / w.W) * w.amp;
        pts.push([x, y]);
      }
      var d = 'M ' + pts[0][0] + ' ' + pts[0][1];
      for (var k = 1; k < pts.length; k++) {
        var c1x = (pts[k - 1][0] + pts[k][0]) / 2;
        d += ' C ' + c1x + ' ' + pts[k - 1][1] + ', ' + c1x + ' ' + pts[k][1] + ', ' + pts[k][0] + ' ' + pts[k][1];
      }
      if (w.fill) d += ' L ' + w.W + ' ' + 120 + ' L 0 ' + 120 + ' Z';
      w.path.setAttribute('d', d);
    }
  }

  function loop(now) {
    frame(now);
    requestAnimationFrame(loop);
  }

  function init() {
    var svgs = global.document.querySelectorAll('svg[data-wave]');
    if (!svgs.length) return;

    var reduced = prefersReduced();

    Array.prototype.forEach.call(svgs, function (svg) {
      var inst = buildPath(svg);
      svg.setAttribute('viewBox', '0 0 1600 120');
      svg.setAttribute('preserveAspectRatio', 'none');
      instances.push(inst);

      if (reduced) return; // static curve, no observer needed
    });

    if (reduced || instances.length === 0) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var inst = instances.find(function (x) { return x.svg === entry.target; });
        if (inst) inst.visible = entry.isIntersecting;
      });
    }, { threshold: 0 });
    instances.forEach(function (inst) { inst.visible = false; io.observe(inst.svg); });

    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }

    global.document.addEventListener('visibilitychange', function () {
      // keep drawing only when the tab is visible; IO will gate visibility
    });
  }

  global.BH = global.BH || {};
  global.BH.waves = { init: init, buildPath: buildPath };
})(window);