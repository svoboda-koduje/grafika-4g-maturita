/* Grafika 4.G – příprava k maturitě: společný skript všech stránek
   (navigace, průběh čtení, zjevování, kvízy, kontrolní seznamy, časovač, lightbox, stav lekcí) */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k, d){ try { const v = localStorage.getItem("gr4:" + k); return v === null ? d : JSON.parse(v); } catch(_) { return d; } },
  set(k, v){ try { localStorage.setItem("gr4:" + k, JSON.stringify(v)); } catch(_) {} }
};
const PAGE = document.body.dataset.page || "";

/* ---------- Navigace ---------- */
(function nav(){
  const btn = $(".nav-toggle"), menu = $("#menu");
  if (btn && menu){
    btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
  }
  $$(".main-nav .grp > button").forEach(b => {
    b.addEventListener("click", e => {
      e.stopPropagation();
      const g = b.parentElement, open = g.classList.contains("open");
      $$(".main-nav .grp.open").forEach(x => { x.classList.remove("open"); $("button", x).setAttribute("aria-expanded", "false"); });
      if (!open){
        g.classList.remove("vpravo"); g.classList.add("open"); b.setAttribute("aria-expanded", "true");
        const d = $(".drop", g); if (d && d.getBoundingClientRect().right > window.innerWidth - 8) g.classList.add("vpravo");
      }
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".main-nav .grp")) $$(".main-nav .grp.open").forEach(x => { x.classList.remove("open"); $("button", x).setAttribute("aria-expanded", "false"); }); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".main-nav .grp.open").forEach(x => x.classList.remove("open")); });
})();

/* ---------- Průběh čtení + šipka nahoru ---------- */
(function progress(){
  const bar = $("#progress"), top = $("#totop"), ring = top && $("circle", top);
  function upd(){
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight, p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    if (top){ top.classList.toggle("show", h.scrollTop > 600); if (ring) ring.style.strokeDashoffset = String(157 - 157 * p); }
  }
  addEventListener("scroll", upd, {passive: true}); upd();
  if (top) top.addEventListener("click", () => scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"}));
})();

/* ---------- Zjevování ---------- */
(function reveal(){
  const els = $$(".reveal"); if (!els.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }), {rootMargin: "0px 0px -8% 0px"});
  els.forEach(e => io.observe(e));
})();

/* ---------- Pozadí: jemná síť sazebního obrazce ---------- */
(function bg(){
  const c = $("#bg"); if (!c) return;
  const ctx = c.getContext("2d");
  function draw(){
    const w = c.width = innerWidth, h = c.height = innerHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(35,39,45,.06)"; ctx.lineWidth = 1;
    const step = 56;
    for (let x = (w % step) / 2; x < w; x += step){ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += step){ ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(162,75,219,.12)"; ctx.setLineDash([6, 6]);
    ctx.strokeRect(w * .08, h * .1, w * .84, h * 1.2);
  }
  draw(); addEventListener("resize", draw);
})();

/* ---------- Kvízy: <div class="quiz" data-quiz='[{"q":"...","o":["a","b"],"a":0,"w":"proč"}]'> ---------- */
(function quizzes(){
  $$("[data-quiz]").forEach(el => {
    let data = [];
    try { data = JSON.parse(el.dataset.quiz); } catch(e){ el.textContent = "Kvíz se nepodařilo načíst."; return; }
    const klic = "kviz:" + PAGE + ":" + (el.id || "");
    let ok = 0, hotovych = 0;
    el.innerHTML = data.map((k, i) => `<div class="q" data-i="${i}"><p>${i + 1}. ${k.q}</p><div class="opts">${k.o.map((o, j) => `<button type="button" data-j="${j}">${o}</button>`).join("")}</div><p class="why">${k.w}</p></div>`).join("") + `<p class="score" aria-live="polite"></p>`;
    const skore = $(".score", el);
    function text(){ skore.textContent = hotovych < data.length ? `Správně ${ok} z ${hotovych}` : (ok === data.length ? `Výborně – ${ok} z ${data.length}! Tuto otázku máš v malíku.` : `Hotovo: ${ok} z ${data.length}. Projdi si vysvětlení u chybných odpovědí a zkus to zítra znovu.`); }
    el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const q = b.closest(".q"); if (q.classList.contains("done")) return;
      const k = data[+q.dataset.i]; q.classList.add("done"); hotovych++;
      if (+b.dataset.j === k.a){ b.classList.add("ok"); ok++; } else { b.classList.add("bad"); $(`[data-j="${k.a}"]`, q).classList.add("ok"); }
      text();
      if (hotovych === data.length){ const best = store.get(klic, 0); store.set(klic, Math.max(best, ok / data.length)); oznacHotovo(); }
    });
    if (store.get(klic, 0) >= 1) skore.textContent = "Tento kvíz už máš splněný bez chyby. Klidně si ho projdi znovu.";
  });
})();

/* ---------- Kontrolní seznamy s pamětí: <ul class="checklist" data-checklist="id"> ---------- */
(function checklists(){
  $$("[data-checklist]").forEach(ul => {
    const klic = "check:" + ul.dataset.checklist;
    const inputs = $$("input[type=checkbox]", ul), saved = store.get(klic, {});
    inputs.forEach((i, n) => { i.checked = !!saved[n]; });
    const score = ul.parentElement.querySelector(".check-score") || (() => { const p = document.createElement("p"); p.className = "check-score"; ul.after(p); return p; })();
    function upd(){
      const done = inputs.filter(i => i.checked).length;
      score.textContent = done === inputs.length ? `Hotovo – všech ${inputs.length} bodů zkontrolováno.` : `Zkontrolováno ${done} z ${inputs.length}.`;
      score.classList.toggle("done", done === inputs.length);
      const o = {}; inputs.forEach((i, n) => { if (i.checked) o[n] = 1; }); store.set(klic, o);
    }
    ul.addEventListener("change", upd); upd();
    const reset = ul.parentElement.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", () => { inputs.forEach(i => i.checked = false); upd(); });
  });
})();

/* ---------- Časovač 30 + 15 minut ---------- */
(function timers(){
  $$("[data-timer]").forEach(el => {
    const fáze = [["Samostatná práce u počítače", 30 * 60], ["Obhajoba před komisí", 15 * 60]];
    let f = 0, zbyva = fáze[0][1], t = null;
    el.innerHTML = `<span class="cas">30:00</span><span class="faze">${fáze[0][0]}</span><button type="button" data-a="start">Spustit</button><button type="button" data-a="reset">Vynulovat</button>`;
    const cas = $(".cas", el), faze = $(".faze", el), start = $('[data-a="start"]', el);
    function show(){ const m = Math.floor(zbyva / 60), s = zbyva % 60; cas.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; faze.textContent = fáze[f][0]; }
    function tick(){
      zbyva--; if (zbyva <= 0){ if (f === 0){ f = 1; zbyva = fáze[1][1]; el.classList.add("end"); setTimeout(() => el.classList.remove("end"), 2500); } else { clearInterval(t); t = null; start.textContent = "Spustit"; el.classList.add("end"); zbyva = 0; } }
      show();
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.a === "start"){ if (t){ clearInterval(t); t = null; b.textContent = "Pokračovat"; } else { t = setInterval(tick, 1000); b.textContent = "Pozastavit"; } }
      else { clearInterval(t); t = null; f = 0; zbyva = fáze[0][1]; el.classList.remove("end"); start.textContent = "Spustit"; show(); }
    });
    show();
  });
})();

/* ---------- Lightbox pro obrázky s data-zoom ---------- */
(function lightbox(){
  const imgs = $$("img[data-zoom], .dila img, .screens img"); if (!imgs.length) return;
  const lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = `<figure><img alt=""></figure><div class="lb-cap"></div><button class="lb-close" type="button" aria-label="Zavřít"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
  document.body.appendChild(lb);
  const im = $("img", lb), cap = $(".lb-cap", lb);
  function open(img){ im.src = img.dataset.full || img.src; im.alt = img.alt; const fc = img.closest("figure") && img.closest("figure").querySelector("figcaption"); cap.innerHTML = fc ? fc.innerHTML : (img.alt || ""); lb.classList.add("open"); }
  imgs.forEach(img => { img.addEventListener("click", () => open(img)); img.tabIndex = 0; img.addEventListener("keydown", e => { if (e.key === "Enter") open(img); }); });
  lb.addEventListener("click", e => { if (e.target === lb || e.target.closest(".lb-close") || e.target === im) lb.classList.remove("open"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("open"); });
})();

/* ---------- Stav lekcí: navštíveno / kvíz splněn ---------- */
function oznacHotovo(){
  const m = PAGE.match(/^(\d\d)-/); if (!m) return;
  const s = store.get("lekce", {}); s[m[1]] = Math.max(s[m[1]] || 0, 2); store.set("lekce", s);
}
(function visited(){
  const m = PAGE.match(/^(\d\d)-/);
  if (m){ const s = store.get("lekce", {}); s[m[1]] = Math.max(s[m[1]] || 0, 1); store.set("lekce", s); }
  // na úvodní stránce: vyznač stav
  const s = store.get("lekce", {});
  $$("[data-lekce]").forEach(a => { const st = s[a.dataset.lekce] || 0; if (st >= 2) a.classList.add("hot"); if (st >= 2 && !$(".hot", a)) a.insertAdjacentHTML("beforeend", '<span class="hot" title="Kvíz splněn bez chyby">✓</span>'); });
  const pr = $("[data-prubeh]");
  if (pr){ const n = Object.values(s).filter(v => v >= 2).length; $("i", pr).style.width = (n / 23 * 100) + "%"; $("span", pr).textContent = `${n} z 23 kvízů splněno bez chyby`; }
})();

/* ---------- YouTube: načíst přehrávač až po kliknutí ---------- */
(function yt(){
  $$(".video[data-yt]").forEach(v => {
    const id = v.dataset.yt, btn = $(".play", v);
    if (!btn) return;
    btn.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    btn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`; f.title = v.dataset.t || "Video"; f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"; f.allowFullscreen = true;
      btn.replaceWith(f);
    });
  });
})();

/* ---------- Záložky (tabs) ---------- */
(function tabs(){
  $$(".tabs").forEach(t => {
    const btns = $$(".tablist button", t), panels = $$(".tabpanel", t);
    btns.forEach((b, i) => b.addEventListener("click", () => { btns.forEach((x, j) => { x.setAttribute("aria-selected", String(i === j)); panels[j].hidden = i !== j; }); }));
  });
})();

/* ---------- Poznávačka: skrytí popisků ---------- */
(function poznavacka(){
  $$("[data-poznavacka]").forEach(root => {
    const grid = $(".dila", root), btn = $("[data-skryt]", root);
    if (!grid || !btn) return;
    let skryto = false;
    btn.addEventListener("click", () => {
      skryto = !skryto;
      $$("figure", grid).forEach(f => { f.classList.toggle("skryt", skryto); });
      btn.textContent = skryto ? "Zobrazit popisky" : "Skrýt popisky (poznávačka)";
    });
    const mix = $("[data-michat]", root);
    if (mix) mix.addEventListener("click", () => { const fs = $$("figure", grid); fs.sort(() => Math.random() - .5).forEach(f => grid.appendChild(f)); });
  });
})();
