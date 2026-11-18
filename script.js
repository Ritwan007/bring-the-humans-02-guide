/* HUMANITY.exe — vanilla interactions. No dependencies. */
(function () {
  "use strict";

  var doc = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.documentElement.classList.add("js");

  /* ---------- Mobile nav ---------- */
  var navToggle = doc.querySelector(".nav-toggle");
  var navList = doc.getElementById("nav-list");
  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navList.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  var accButtons = Array.prototype.slice.call(doc.querySelectorAll(".acc-btn"));
  accButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = doc.getElementById(btn.getAttribute("aria-controls"));
      var willOpen = btn.getAttribute("aria-expanded") !== "true";
      accButtons.forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        var otherPanel = doc.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) otherPanel.hidden = true;
      });
      btn.setAttribute("aria-expanded", String(willOpen));
      if (panel) panel.hidden = !willOpen;
    });
  });

  /* ---------- Copy referral link ---------- */
  var copyBtn = doc.getElementById("copy-link");
  var linkInput = doc.getElementById("referral-link");
  var copyStatus = doc.getElementById("copy-status");
  if (copyBtn && linkInput) {
    copyBtn.addEventListener("click", function () {
      var text = linkInput.value;
      function done(ok) {
        copyStatus.textContent = ok
          ? "Copied — share it with someone who builds."
          : "Copy didn't work in this browser — long-press the link to copy it.";
        copyBtn.textContent = ok ? "Copied" : "Copy link";
        window.setTimeout(function () { copyBtn.textContent = "Copy link"; }, 2500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        linkInput.select();
        try { done(doc.execCommand("copy")); } catch (err) { done(false); }
        linkInput.blur();
      }
    });
  }

  /* ---------- Custom cursor (fine pointers only) ---------- */
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var cursor = doc.querySelector(".cursor");
  var dot = cursor ? cursor.querySelector(".cursor-dot") : null;
  var ring = cursor ? cursor.querySelector(".cursor-ring") : null;
  if (finePointer && cursor && dot && ring && !reduced) {
    var cx = -100, cy = -100, rx = -100, ry = -100, shown = false;
    doc.addEventListener("mousemove", function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!shown) { shown = true; rx = cx; ry = cy; }
      dot.style.transform = "translate(" + (cx - 3) + "px," + (cy - 3) + "px)";
    }, { passive: true });
    (function follow() {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - 17) + "px," + (ry - 17) + "px)";
      requestAnimationFrame(follow);
    })();
    doc.addEventListener("mouseover", function (e) {
      var t = e.target.closest("a, button, input, .acc-btn");
      cursor.classList.toggle("hovering", !!t);
    }, { passive: true });
  }

  /* ---------- Scroll reveals ---------- */
  var revealTargets = doc.querySelectorAll(".signal, .how, .invite, .faq, .final, .hero-figure");
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Generative human wave ---------- */
  var svg = doc.getElementById("human-wave");
  var linesG = doc.getElementById("wave-lines");
  var peopleG = doc.getElementById("wave-people");
  if (svg && linesG && peopleG) {
    var NS = "http://www.w3.org/2000/svg";
    var W = 720, H = 420;
    var LANES = 5;
    var PER_LANE = 46;
    var dots = [];
    var pointer = { x: -9999, y: -9999 };

    function laneY(lane, x, t) {
      var base = 70 + lane * 70;
      var amp = 26 + lane * 7;
      return base + Math.sin(x / 150 + t * 0.9 + lane * 1.1) * amp
                 + Math.sin(x / 57 + t * 0.5 + lane * 2.3) * 9;
    }

    function personPath(x, y, s) {
      var head = "M " + x + " " + (y - 7 * s) +
        " m -2.6 0 a 2.6 2.6 0 1 0 5.2 0 a 2.6 2.6 0 1 0 -5.2 0";
      var body = "M " + x + " " + (y - 4 * s) +
        " c -2.4 0 -3.4 2.2 -3.4 4.6 l 0 5 " +
        "M " + x + " " + (y - 4 * s) +
        " c 2.4 0 3.4 2.2 3.4 4.6 l 0 5 " +
        "M " + x + " " + (y + 1 * s) + " l -1.8 7 " +
        "M " + x + " " + (y + 1 * s) + " l 1.8 7";
      return head + " " + body;
    }

    var i, lane, x, path, d;
    for (lane = 0; lane < LANES; lane++) {
      path = doc.createElementNS(NS, "path");
      d = "M -20 " + laneY(lane, -20, 0).toFixed(1);
      for (x = 0; x <= W + 20; x += 20) d += " L " + x + " " + laneY(lane, x, 0).toFixed(1);
      path.setAttribute("d", d);
      path.dataset.lane = String(lane);
      linesG.appendChild(path);
    }

    for (lane = 0; lane < LANES; lane++) {
      for (i = 0; i < PER_LANE; i++) {
        var el = doc.createElementNS(NS, "path");
        var baseX = (i / PER_LANE) * (W + 40) - 20;
        var s = 0.75 + (lane % 3) * 0.18;
        el.setAttribute("d", personPath(baseX, laneY(lane, baseX, 0), s));
        el.setAttribute("stroke", "none");
        el.setAttribute("opacity", (0.45 + lane * 0.12).toFixed(2));
        peopleG.appendChild(el);
        dots.push({ el: el, lane: lane, bx: baseX, s: s, phase: (i * 0.37 + lane) % 6.28, ox: 0, oy: 0 });
      }
    }

    function draw(t) {
      var linePaths = linesG.querySelectorAll("path");
      linePaths.forEach(function (p) {
        var ln = Number(p.dataset.lane);
        var dd = "M -20 " + laneY(ln, -20, t).toFixed(1);
        for (var xx = 0; xx <= W + 20; xx += 20) dd += " L " + xx + " " + laneY(ln, xx, t).toFixed(1);
        p.setAttribute("d", dd);
      });
      dots.forEach(function (dotObj) {
        var sway = Math.sin(t * 0.8 + dotObj.phase) * 6;
        var px = dotObj.bx + sway + dotObj.ox;
        var py = laneY(dotObj.lane, dotObj.bx + sway, t) + dotObj.oy;
        dotObj.el.setAttribute("d", personPath(px, py, dotObj.s));
        dotObj.ox *= 0.92;
        dotObj.oy *= 0.92;
      });
    }

    function pointerToSvg(evt) {
      var rect = svg.getBoundingClientRect();
      return {
        x: (evt.clientX - rect.left) * (W / rect.width),
        y: (evt.clientY - rect.top) * (H / rect.height)
      };
    }
    svg.addEventListener("pointermove", function (evt) {
      pointer = pointerToSvg(evt);
      dots.forEach(function (dotObj) {
        var py = laneY(dotObj.lane, dotObj.bx, 0);
        var dx = dotObj.bx - pointer.x;
        var dy = py - pointer.y;
        var dist2 = dx * dx + dy * dy;
        if (dist2 < 8100) {
          var dist = Math.sqrt(dist2) || 1;
          var push = (90 - dist) / 90 * 14;
          dotObj.ox += (dx / dist) * push;
          dotObj.oy += (dy / dist) * push;
        }
      });
    }, { passive: true });
    svg.addEventListener("pointerleave", function () { pointer = { x: -9999, y: -9999 }; });

    if (reduced) {
      draw(1.2);
    } else {
      var start = null;
      var visible = true;
      var visObserver = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0 });
      visObserver.observe(svg);
      (function tick(ts) {
        if (start === null) start = ts;
        if (visible) draw((ts - start) / 1000);
        requestAnimationFrame(tick);
      })(performance.now());
    }
  }
})();
