(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = document.querySelectorAll("[data-reveal]");

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    document.querySelectorAll(".skills, .projects").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--delay", i * 80 + "ms");
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { io.observe(el); });

    setTimeout(showAll, 2500);
  }

  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav__links");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", function (e) {
    if (!links.classList.contains("is-open")) return;
    if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 1900);
  }

  function copyHandle(handle) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(handle).then(function () {
        showToast("Скопировано: " + handle);
      }, fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = handle;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showToast("Скопировано: " + handle); }
      catch (err) { showToast("Ник: " + handle); }
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll("[data-handle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyHandle(btn.getAttribute("data-handle"));
    });
  });

  var pop = document.getElementById("contactPop");
  pop.addEventListener("click", function () { copyHandle("@xaqozi"); });

  var counters = document.querySelectorAll("[data-count]");

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }

    var start = null;
    var duration = 1300;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var cIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cIo.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  var codeEl = document.getElementById("codeType");
  var codeLines = [
    { t: "// Brave.exe", c: "c" },
    { t: "class Brave implements Developer {", c: "k" },
    { t: "  final years = 7;", c: "n" },
    { t: "  final tasks = <String>['mobiles',", c: "n" },
    { t: "    'backends', 'security'];", c: "n" },
    { t: "", c: "n" },
    { t: "  String solve(Task task) => switch (task) {", c: "f" },
    { t: "    _ => 'делаю, даже если сложно',", c: "s" },
    { t: "  };", c: "f" },
    { t: "}", c: "k" },
    { t: "", c: "n" },
    { t: "// contact: @xaqozi", c: "c" },
  ];

  function buildPlain() {
    return codeLines.map(function (l) { return l.t; }).join("\n");
  }

  function render(prefixLen) {
    var left = prefixLen;
    var html = "";
    codeLines.forEach(function (line, idx) {
      if (idx > 0) {
        if (left <= 0) return;
        html += "\n";
        left -= 1;
      }
      if (left <= 0) return;
      var part = line.t.slice(0, left);
      left -= part.length;
      html += part ? '<span class="' + line.c + '">' + escapeHtml(part) + "</span>" : "";
    });
    codeEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, function (ch) {
      return ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : "&gt;";
    });
  }

  if (!reduceMotion) {
    var full = buildPlain();
    var i = 0;
    render(0);
    setTimeout(function tick() {
      i += 1;
      render(i);
      if (i < full.length) {
        setTimeout(tick, 14 + Math.random() * 22);
      }
    }, 700);
  } else {
    render(buildPlain().length);
  }

  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card--tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" +
          (x * 5).toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    document.querySelectorAll("[data-spot]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }
})();
