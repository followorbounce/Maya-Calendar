/* ============================================================
   JU'UN K'IN — shared site chrome
   Renders top bar, section nav, footer, nav overlay, theme
   toggle, sticky "today" readout, deep-link + toast helpers,
   keyboard access for SVG ring/gear segments, and structured
   data. Additive: pages keep their own logic.
   ============================================================ */
(function () {
  "use strict";

  var THEME_KEY = "juunkin-theme";
  /* Inline manifest — the source of truth for the chrome, so the header renders
     synchronously with no fetch race. pages.json (read by the sitemap workflow)
     mirrors this; if it loads and differs, the chrome re-renders from it. */
  var FALLBACK = {
    site: { title: "Ju'un K'in", tagline: "A Classic Maya Calendar Reference", correlation: "GMT 584283" },
    pages: [
      { slug: "index", file: "index.html", code: "K'IN", label: "Today", status: "live" },
      { slug: "tzolkin", file: "tzolkin.html", code: "260", label: "Tzolk'in — Sacred Calendar", status: "live" },
      { slug: "haab", file: "haab.html", code: "365", label: "Haab' — Solar Calendar", status: "live" },
      { slug: "calendar-round", file: "calendar-round.html", code: "18980", label: "Calendar Round", status: "live" },
      { slug: "long-count", file: "long-count.html", code: "0.0.0.0.0", label: "Long Count", status: "live" },
      { slug: "cosmology", file: "cosmology.html", code: "4+1", label: "Directional Cosmology", status: "live" },
      { slug: "dreamspell", file: "dreamspell.html", code: "13:20", label: "Dreamspell Interpretation", status: "live" },
      { slug: "sources", file: "sources.html", code: "REF", label: "Sources & Method", status: "live" }
    ]
  };

  function h(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function currentPage() { return document.body.getAttribute("data-page") || "index"; }

  /* ---------- theme ---------- */
  function initTheme() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { }
    if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : cur === "light" ? "dark"
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { }
  }

  /* ---------- toast ---------- */
  var toastEl;
  window.mcToast = function (msg) {
    if (!toastEl) { toastEl = h("div", { class: "toast" }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  };
  window.mcCopy = function (text, label) {
    var done = function () { window.mcToast((label || "Copied") + ": " + text); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var t = h("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (e) { }
      document.body.removeChild(t); done();
    }
  };

  /* ---------- chrome ---------- */
  var built = false;
  function build(manifest) {
    var pages = manifest.pages, site = manifest.site;
    var here = currentPage();

    var header = document.getElementById("site-header");
    var footSlot = document.getElementById("site-footer");
    if (built) { // re-render from pages.json
      if (header) header.innerHTML = "";
      if (footSlot) footSlot.innerHTML = "";
      var oldOv = document.getElementById("navOverlay"); if (oldOv) oldOv.remove();
    }
    built = true;

    /* top bar */
    var bar = h("div", { class: "topbar" });
    var brand = h("a", { class: "brand", href: "index.html" },
      '<span class="glyph-mark">' + site.title + '</span>' +
      '<span class="sub">' + (site.tagline || "") + '</span>');
    var ctrls = h("div", { class: "topctrls" });
    var navBtn = h("button", { class: "iconbtn", "aria-haspopup": "dialog", "aria-label": "All sections" }, "☷ Index");
    var themeBtn = h("button", { class: "iconbtn", "aria-label": "Toggle light or dark theme" }, "◐");
    navBtn.addEventListener("click", openOverlay);
    themeBtn.addEventListener("click", toggleTheme);
    ctrls.appendChild(navBtn); ctrls.appendChild(themeBtn);
    bar.appendChild(brand); bar.appendChild(ctrls);

    /* section nav */
    var sec = h("nav", { class: "secnav", "aria-label": "Sections" });
    var secInner = h("div", { class: "secnav-inner" });
    pages.forEach(function (p) {
      var a = h("a", { href: p.file }, p.label.replace(/—.*$/, "").trim());
      if (p.slug === here) a.setAttribute("aria-current", "page");
      if (p.status && p.status !== "live") a.className = "soon";
      secInner.appendChild(a);
    });
    sec.appendChild(secInner);

    /* sticky mini-today */
    var mini = h("div", { class: "mini-today", id: "miniToday", "aria-hidden": "true" });

    /* footer */
    var foot = h("footer", { class: "site-footer" });
    var fnav = h("div", { class: "fnav" });
    pages.forEach(function (p) {
      fnav.appendChild(h("a", { href: p.file }, p.label.replace(/—.*$/, "").trim()));
    });
    foot.appendChild(fnav);
    foot.appendChild(h("div", null,
      "Correlation constant: " + (site.correlation || "GMT 584283") +
      " · 0.0.0.0.0 = 11 August 3114 BCE (proleptic Gregorian)"));
    foot.appendChild(h("div", null,
      "A reference exhibit — not a predictive or divinatory tool. " +
      '<a href="sources.html">Sources &amp; method</a>.'));

    if (header) { header.appendChild(bar); header.appendChild(sec); header.appendChild(mini); }
    if (footSlot) footSlot.appendChild(foot);

    buildOverlay(pages, site, here);
    structuredData(pages, site, here);
  }

  /* ---------- overlay ---------- */
  var overlay;
  function buildOverlay(pages, site, here) {
    overlay = h("div", { class: "nav-overlay", id: "navOverlay", role: "dialog", "aria-modal": "true", "aria-label": "All sections", hidden: "hidden" });
    var panel = h("div", { class: "nav-panel wrap" });
    panel.appendChild(h("h2", null, site.title + " — all sections"));
    var ol = h("ol");
    pages.forEach(function (p) {
      var li = h("li");
      var a = h("a", { href: p.file },
        "<span>" + p.label + (p.slug === here ? " · you are here" : "") + "</span>" +
        '<span class="code">' + (p.code || "") + "</span>");
      li.appendChild(a); ol.appendChild(li);
    });
    panel.appendChild(ol);
    var close = h("button", { class: "iconbtn", style: "margin-top:16px" }, "Close");
    close.addEventListener("click", closeOverlay);
    panel.appendChild(close);
    overlay.appendChild(panel);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeOverlay(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeOverlay(); });
    document.body.appendChild(overlay);
  }
  function openOverlay() { if (overlay) { overlay.hidden = false; var f = overlay.querySelector("a"); if (f) f.focus(); } }
  function closeOverlay() { if (overlay) overlay.hidden = true; }

  /* ---------- sticky mini-today ---------- */
  function initMiniToday() {
    var mini = document.getElementById("miniToday");
    if (!mini || !window.MC || mini._init) return;
    mini._init = true;
    var anchor = document.querySelector("[data-mini-anchor]") || document.querySelector("h1.page-title") || document.querySelector(".hero-intro");
    function paint() {
      try {
        var tz = (document.getElementById("tzSelect") || {}).value ||
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        var t = window.MC.todayInZone(tz);
        var r = window.MC.readingFromGregorian(t.y, t.m, t.d);
        mini.innerHTML = "<b>" + window.MC.formatLC(r.lc) + "</b>" +
          "<span>" + r.tz.num + " " + r.tz.sign + "</span>" +
          "<span>" + window.MC.haabLabel(r.hb) + "</span>";
      } catch (e) { }
    }
    paint();
    setInterval(paint, 60000);
    var io;
    if (anchor && "IntersectionObserver" in window) {
      io = new IntersectionObserver(function (ents) {
        mini.classList.toggle("show", !ents[0].isIntersecting && ents[0].boundingClientRect.top < 0);
      }, { threshold: 0 });
      io.observe(anchor);
    }
  }

  /* ---------- keyboard access for SVG segments ---------- */
  function stampInteractive() {
    var segs = document.querySelectorAll(".ring-seg[data-key], .gear-tooth[data-key], .kin-cell, .daychip, .haab-month[data-key]");
    [].forEach.call(segs, function (n) {
      if (!n.hasAttribute("tabindex")) n.setAttribute("tabindex", "0");
      if (!n.getAttribute("role")) n.setAttribute("role", "button");
      n.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); n.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
      });
    });
  }
  window.mcStampInteractive = stampInteractive;

  /* ---------- structured data ---------- */
  function structuredData(pages, site, here) {
    if (ldStamped) return;
    ldStamped = true;
    var cur = pages.filter(function (p) { return p.slug === here; })[0] || pages[0];
    var ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": cur.label + " — " + site.title,
      "description": cur.blurb || site.tagline,
      "isPartOf": { "@type": "WebSite", "name": site.title, "url": site.url },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": site.title, "item": (site.url || "") },
          { "@type": "ListItem", "position": 2, "name": cur.label }
        ]
      }
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ---------- structured-data guard (avoid duplicate on re-render) ---------- */
  var ldStamped = false;

  /* ---------- boot ---------- */
  initTheme();
  function boot() {
    build(FALLBACK);           // synchronous — no fetch race
    initMiniToday();
    stampInteractive();
    // progressively reconcile with pages.json (adds blurbs/codes for the overlay)
    if (typeof fetch === "function") {
      fetch("pages.json").then(function (r) { return r.ok ? r.json() : null; })
        .then(function (m) {
          if (!m || !m.pages || !m.pages.length) return;
          var sig = function (x) { return x.pages.map(function (p) { return p.slug + "|" + p.file + "|" + p.label + "|" + (p.status || "live"); }).join(";"); };
          if (sig(m) === sig(FALLBACK)) return; // chrome already matches the manifest
          build(m); initMiniToday(); stampInteractive();
        }).catch(function () { });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* stamp again after pages inject dynamic content */
  window.addEventListener("mc:rendered", stampInteractive);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { });
    });
  }
})();
