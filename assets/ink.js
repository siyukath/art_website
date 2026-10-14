/* Drifting ink threads, from the first siyuzhong.com. Finer now: drawn at device resolution,
   thinner, slower, lower opacity, on a transparent canvas so the paper shows through.
   Starts already grown in, pauses when the tab is hidden, holds still under reduced motion. */
(function () {
  var canvas = document.getElementById("ink");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var P = window.INK || {};
  var SIZE_MIN = P.sizeMin || 0.3, SIZE_RANGE = P.sizeRange || 0.7;
  var ALPHA = P.alpha || 0.026, FADE = P.fade || 0.013;
  var FORCE = P.force || 0.03, DAMP = P.damp || 0.985, JIT = P.jit || 0.07;
  var DENS = P.dens || 420, WARM = P.warm || 800;
  if ((window.devicePixelRatio || 1) < 1.5) ALPHA *= 1.4; /* thin lines need a little more on a 1x screen */
  var COLORS = [
    "rgba(235, 100, 80, " + ALPHA + ")",
    "rgba(140, 170, 100, " + ALPHA + ")",
    "rgba(240, 180, 100, " + ALPHA + ")",
    "rgba(200, 190, 180, " + (ALPHA * 0.7) + ")"
  ];
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var w = 0, h = 0, dpr = 1, parts = [], running = false;

  function Particle() { this.reset(); }
  Particle.prototype.reset = function () {
    this.x = Math.random() * w; this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.6; this.vy = (Math.random() - 0.5) * 0.6;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * SIZE_RANGE + SIZE_MIN;
    this.life = 0; this.maxLife = Math.random() * 400 + 160;
    this.angle = Math.random() * Math.PI * 2;
  };
  Particle.prototype.step = function () {
    this.angle += (Math.random() - 0.5) * JIT;
    this.vx += Math.cos(this.angle) * FORCE; this.vy += Math.sin(this.angle) * FORCE;
    this.vx *= DAMP; this.vy *= DAMP;
    this.x += this.vx; this.y += this.vy; this.life++;
    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h || this.life > this.maxLife) this.reset();
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
  };

  function frame() {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + FADE + ")"; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    for (var i = 0; i < parts.length; i++) parts[i].step();
  }

  function setup() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var n = Math.round(DENS * (w * h) / (1440 * 900));
    parts = []; for (var i = 0; i < n; i++) parts.push(new Particle());
  }

  function prewarm(done) {
    var left = WARM;
    (function batch() {
      for (var i = 0; i < 60 && left > 0; i++, left--) frame();
      if (left > 0) requestAnimationFrame(batch); else done();
    })();
  }

  function loop() { if (!running) return; frame(); requestAnimationFrame(loop); }

  function start() {
    setup();
    prewarm(function () {
      canvas.classList.add("ready");
      if (!still && !document.hidden) { running = true; loop(); }
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (still) return;
    if (document.hidden) running = false;
    else if (!running && canvas.classList.contains("ready")) { running = true; loop(); }
  });

  var t;
  window.addEventListener("resize", function () {
    if (Math.round(canvas.getBoundingClientRect().width) === w) return;
    clearTimeout(t);
    t = setTimeout(function () { running = false; canvas.classList.remove("ready"); start(); }, 200);
  });

  start();
})();
