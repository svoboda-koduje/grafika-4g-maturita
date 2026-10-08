/* Grafika 4.G – interaktivní ukázky. Každá ukázka je prvek s atributem data-widget="název". */
"use strict";
(function(){
const W = {};
const q = (s, r = document) => r.querySelector(s);
const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = "http://www.w3.org/2000/svg";
const fmt = (n, d = 1) => Number(n).toLocaleString("cs-CZ", {minimumFractionDigits: d, maximumFractionDigits: d});
function el(tag, attrs = {}, kids = []){
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  kids.forEach(k => e.appendChild(typeof k === "string" ? document.createTextNode(k) : k));
  return e;
}
function bindRange(input){ const out = input.parentElement.querySelector("output"); const f = () => { if (out) out.textContent = input.value; }; input.addEventListener("input", f); f(); }
function seg(root, cb){
  qa("button", root).forEach(b => b.addEventListener("click", () => { qa("button", root).forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); cb(b.dataset.v); }));
}
const txt = (x, y, s, cls = "g-txt2", extra = {}) => el("text", Object.assign({x, y, class: cls}, extra), [s]);

/* ---------- Efektivní ppi ---------- */
W.ppi = root => {
  const svg = q("svg", root), px = q("[data-px]", root), mm = q("[data-mm]", root), out = q("[data-out]", root);
  [px, mm].forEach(bindRange);
  function draw(){
    const P = +px.value, M = +mm.value, ppi = P / (M / 25.4);
    svg.innerHTML = "";
    const w = Math.min(380, 60 + M * 1.1), h = w * 0.66, x = 20, y = 30;
    svg.appendChild(el("rect", {x, y, width: w, height: h, fill: "#F4F0E7", stroke: "#23272D"}));
    const n = Math.max(3, Math.min(40, Math.round(P / 150)));
    const c = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < Math.ceil(h / c); j++){
      const t = (Math.sin(i * .7) + Math.cos(j * .9)) * .5 + .5;
      svg.appendChild(el("rect", {x: x + i * c, y: y + j * c, width: c + .3, height: Math.min(c + .3, y + h - (y + j * c)), fill: `rgb(${60 + t * 150},${90 + t * 100},${150 - t * 60})`}));
    }
    svg.appendChild(el("rect", {x, y, width: w, height: h, fill: "none", stroke: "#23272D", "stroke-width": 1.5}));
    svg.appendChild(txt(x + w / 2, y + h + 22, `${M} mm v sazbě`, "g-txt2", {"text-anchor": "middle"}));
    svg.appendChild(txt(x + w / 2, y - 10, `${P} px`, "g-txt2", {"text-anchor": "middle"}));
    const ok = ppi >= 300;
    svg.appendChild(txt(x + w / 2, y + h + 48, `${Math.round(ppi)} ppi`, "g-txt", {"text-anchor": "middle", fill: ok ? "#4E7A45" : "#A33", style: "font-size:22px;font-weight:700"}));
    out.innerHTML = `<b>${Math.round(ppi)} ppi</b> efektivně. ${ok ? "V pořádku pro ofsetový tisk (≥ 300 ppi)." : ppi >= 200 ? "Hraniční – pro tisk se bude jevit měkce; zmenši rámeček nebo použij větší obrázek." : "Nedostatečné – v tisku budou vidět pixely. Potřebuješ obrázek s " + Math.ceil(300 * M / 25.4) + " px na šířku."}`;
  }
  [px, mm].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Kalkulačka obálky (hřbet, V2, V8, přebal) ---------- */
W.hrbet = root => {
  const svg = q("svg", root), fsel = q("[data-format]", root), st = q("[data-strany]", root), pap = q("[data-papir]", root), out = q("[data-out]", root);
  const F = {A5: [148, 210], B5: [176, 250], A4: [210, 297], B6: [125, 176], B4: [250, 353]};
  const ZAL = {A5: 70, B5: 90, A4: 110, B6: 60, B4: 120};
  let typ = "V2";
  bindRange(st);
  seg(q("[data-typ]", root), v => { typ = v; draw(); });
  function draw(){
    const [w, h] = F[fsel.value], n = +st.value, k = +pap.value, hr = n * k;
    const drazka = typ === "V8" ? 8 : 0, karton = typ === "V8" || typ === "P" ? 2 : 0, bleed = typ === "V2" ? 3 : 15, zal = typ === "P" ? ZAL[fsel.value] : 0;
    const deska = typ === "V2" ? w : w - 6; // u pevné vazby je deska o něco menší než blok
    const total = zal * 2 + deska * 2 + drazka * 2 + karton * 2 + hr;
    svg.innerHTML = "";
    const S = 460 / (total + 2 * bleed), ox = 30, oy = 40;
    const X = v => ox + v * S, Y = v => oy + v * S;
    const H = h + (typ === "V2" ? 0 : 4);
    // spadávka
    svg.appendChild(el("rect", {x: X(-bleed), y: Y(-bleed), width: (total + 2 * bleed) * S, height: (H + 2 * bleed) * S, fill: "#FBE9E6", stroke: "#D33", "stroke-dasharray": "4 3"}));
    let x = 0;
    const part = (wd, fill, label) => { svg.appendChild(el("rect", {x: X(x), y: Y(0), width: wd * S, height: H * S, fill, stroke: "#23272D", "stroke-width": .8})); if (label) svg.appendChild(txt(X(x + wd / 2), Y(H / 2), label, "g-txt2", {"text-anchor": "middle", style: "font-size:11px"})); x += wd; };
    if (zal){ part(zal, "#EAE4D6", `záložka ${zal}`); }
    part(deska, "#fff", `zadní ${deska}`);
    if (drazka){ part(karton, "#D8D3C8"); part(drazka, "#F1DDD0", "8"); }
    part(hr, "#FBF0C4", `${fmt(hr)}`);
    if (drazka){ part(drazka, "#F1DDD0", "8"); part(karton, "#D8D3C8"); }
    else if (karton){ part(karton, "#D8D3C8"); }
    part(deska, "#fff", `přední ${deska}`);
    if (zal){ part(zal, "#EAE4D6", `záložka ${zal}`); }
    // ořezové značky
    const mk = (xx, yy, dx, dy) => svg.appendChild(el("line", {x1: xx, y1: yy, x2: xx + dx, y2: yy + dy, stroke: "#23272D", "stroke-width": 1}));
    const m = 8 * S + 6;
    [[0, 0], [total, 0], [0, H], [total, H]].forEach(([cx, cy]) => { mk(X(cx), Y(cy) + (cy ? m : -m), 0, cy ? 10 : -10); mk(X(cx) + (cx ? m : -m), Y(cy), cx ? 10 : -10, 0); });
    svg.appendChild(txt(X(total / 2), Y(H) + 14 + bleed * S, `celková šířka ${fmt(total)} mm + 2 × ${bleed} mm spadávka = ${fmt(total + 2 * bleed)} mm`, "g-txt2", {"text-anchor": "middle"}));
    svg.appendChild(txt(X(total / 2), oy - 10 - bleed * S + 2, typ === "V2" ? "V2 – měkká vazba (paperback)" : typ === "V8" ? "V8 – pevná vazba (hardcover) s hřbetními drážkami" : "Volný přebal se záložkami", "g-txt", {"text-anchor": "middle"}));
    out.innerHTML = `Hřbet: <b>${n} × ${k} = ${fmt(hr, 2)} mm</b>${typ !== "V2" ? " + síla materiálu vazby" : ""}.<br>Čistý rozměr: <b>${fmt(total)} × ${H} mm</b>, se spadávkou ${bleed} mm: ${fmt(total + 2 * bleed)} × ${H + 2 * bleed} mm.<br>${typ === "V8" ? "Značky hřbetu posunuté o 2 mm (síla kartonu), drážky 8 mm od značek hřbetu. Doplň 4 linky nahoře a 4 dole." : typ === "P" ? "Záložky se zasouvají pod desky – šířka podle formátu (A5 6–8 cm, B5 8–10 cm, A4 10–12 cm)." : "Text na hřbetu až od cca 150 stran. Texty 10 mm od kraje."}`;
  }
  [fsel, st, pap].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Sirotci a vdovy ---------- */
W.sirotci = root => {
  const stage = q("[data-stage]", root), keep = q("[data-keep]", root), vys = q("[data-vyska]", root);
  bindRange(vys);
  const odst = [4, 6, 3, 5, 4];
  function draw(){
    const H = +vys.value, K = keep.checked;
    const radky = [];
    odst.forEach((n, p) => {
      let start = radky.length % H;
      let zbyva = H - start;
      if (K){
        if (zbyva === 1 && n > 1){ radky.push({p, i: -1}); start = 0; zbyva = H; } // sirotek → posun celý odstavec
        if (n > zbyva && n - zbyva === 1 && zbyva > 1){ radky.push({p, i: -1}); zbyva--; } // vdova → posun o řádek dřív
      }
      for (let i = 0; i < n; i++) radky.push({p, i});
    });
    const cols = Math.ceil(radky.length / H);
    stage.innerHTML = "";
    const wrap = document.createElement("div"); wrap.style.cssText = `display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px`;
    for (let c = 0; c < cols; c++){
      const col = document.createElement("div"); col.style.cssText = "border:1px solid #A24BDB;padding:8px;min-height:" + (H * 20 + 16) + "px";
      for (let r = 0; r < H; r++){
        const it = radky[c * H + r]; const d = document.createElement("div"); d.style.cssText = "height:14px;margin:3px 0;border-radius:2px";
        if (!it || it.i === -1){ d.style.background = "transparent"; d.style.border = "1px dashed #D8D3C8"; col.appendChild(d); continue; }
        const n = odst[it.p]; const last = it.i === n - 1, first = it.i === 0;
        d.style.background = ["#D9F1FA", "#F7DCEA", "#FBF0C4", "#E1EEDC", "#EFE2D2"][it.p];
        d.style.width = last ? "55%" : "100%";
        if (!K){
          if (first && r === H - 1 && n > 1){ d.style.outline = "2px solid #A33"; d.title = "sirotek"; d.dataset.l = "sirotek"; }
          if (last && r === 0 && n > 1){ d.style.outline = "2px solid #A33"; d.title = "vdova"; d.dataset.l = "vdova"; }
        }
        if (d.dataset.l){ d.style.position = "relative"; const s = document.createElement("span"); s.textContent = d.dataset.l; s.style.cssText = "position:absolute;left:calc(100% + 8px);top:-2px;font:700 11px Barlow Condensed,sans-serif;color:#A33;text-transform:uppercase;white-space:nowrap"; d.appendChild(s); }
        col.appendChild(d);
      }
      wrap.appendChild(col);
    }
    stage.appendChild(wrap);
    const p = document.createElement("p"); p.className = "note"; p.style.marginTop = "10px";
    const chyb = stage.querySelectorAll("[data-l]").length;
    p.textContent = K ? "Volba zapnutá: odstavce se posouvají tak, aby na konci i začátku sloupce zůstaly vždy alespoň 2 řádky. Vznikají prázdná místa dole – to je v pořádku, řeší se úpravou textu nebo obrázků." : (chyb ? `Volba vypnutá: ${chyb}× osamělý řádek (sirotek nebo vdova).` : "Volba vypnutá: náhodou žádný sirotek ani vdova – změň výšku sloupce.");
    stage.appendChild(p);
  }
  keep.addEventListener("change", draw); vys.addEventListener("input", draw); draw();
};

/* ---------- Dělení slov ---------- */
W.deleni = root => {
  const stage = q("[data-stage]", root), min = q("[data-min]", root), velka = q("[data-velka]", root), posl = q("[data-posledni]", root), sirka = q("[data-sirka]", root), out = q("[data-out]", root);
  [min, sirka].forEach(bindRange);
  // slabiky oddělené |
  const text = "Na|vrh|nu|tá ti|sko|vi|na mu|sí re|spek|to|vat ty|po|gra|fic|ká pra|vi|dla, ji|nak bu|de čte|nář pře|kva|pe|ný ne|smy|sl|ný|mi roz|dě|le|ní|mi na kon|cích řád|ků. Re|dak|tor ča|so|pi|su Par|du|bic|ký zpra|vo|daj pro|to kon|tro|lu|je kaž|dý od|sta|vec po|mo|cí na|sta|ve|ní od|stav|co|vé|ho sty|lu v In|De|sig|nu.";
  function draw(){
    const M = +min.value, V = velka.checked, P = posl.checked, slova = text.split(" ");
    let zak = 0;
    const html = slova.map((s, idx) => {
      const casti = s.split("|"), plain = s.replace(/\|/g, "");
      const velke = /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(plain), posledni = idx === slova.length - 1;
      let o = "";
      for (let i = 0; i < casti.length; i++){
        o += casti[i];
        if (i < casti.length - 1){
          const po = casti.slice(i + 1).join("").replace(/[.,]/g, "").length, pred = casti.slice(0, i + 1).join("").length;
          const dovol = po >= M && pred >= 2 && (!velke || V) && (!posledni || P);
          if (dovol) o += "­"; else zak++;
        }
      }
      return o;
    }).join(" ");
    stage.innerHTML = `<p style="width:${sirka.value}px;text-align:justify;hyphens:manual;margin:0;border-right:1px solid #A24BDB;padding-right:6px">${html}</p>`;
    out.innerHTML = `Dělí se jen tam, kde za rozdělovníkem zůstanou <b>alespoň ${M} písmena</b>${V ? "" : ", slova s velkým písmenem se nedělí"}${P ? "" : ", poslední slovo odstavce se nedělí"}. Zakázaných míst dělení: <b>${zak}</b>. Změň šířku sloupce a sleduj, kde se slova lámou.`;
  }
  [min, velka, posl, sirka].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Spadávka ---------- */
W.spadavka = root => {
  const svg = q("svg", root), bl = q("[data-bleed]", root), dot = q("[data-dotazeno]", root), zn = q("[data-znacky]", root), rez = q("[data-rez]", root), out = q("[data-out]", root);
  [bl, rez].forEach(bindRange);
  function draw(){
    const B = +bl.value, D = dot.checked, Z = zn.checked, R = +rez.value;
    svg.innerHTML = "";
    const S = 2.1, pw = 100, ph = 60;
    function strana(ox, oy, orez){
      const g = el("g");
      const bx = ox - B * S, by = oy - B * S, bw = (pw + 2 * B) * S, bh = (ph + 2 * B) * S;
      if (!orez){
        g.appendChild(el("rect", {x: bx - 14, y: by - 14, width: bw + 28, height: bh + 28, fill: "#fff", stroke: "#D8D3C8"}));
        // pozadí
        const ext = D ? B : 0;
        g.appendChild(el("rect", {x: ox - ext * S, y: oy - ext * S, width: (pw + 2 * ext) * S, height: (ph * .55 + ext) * S, fill: "#B4532A"}));
        g.appendChild(el("rect", {x: ox - ext * S, y: oy + ph * .55 * S, width: (pw + 2 * ext) * S, height: (ph * .45 + ext) * S, fill: "#FBF0C4"}));
        g.appendChild(el("circle", {cx: ox + pw * .78 * S, cy: oy + ph * .3 * S, r: 9 * S, fill: "#C69A5B"}));
        // spadávka rámeček
        if (B) g.appendChild(el("rect", {x: bx, y: by, width: bw, height: bh, fill: "none", stroke: "#D33", "stroke-dasharray": "4 3"}));
        g.appendChild(el("rect", {x: ox, y: oy, width: pw * S, height: ph * S, fill: "none", stroke: "#23272D", "stroke-width": .8}));
        if (Z){
          const m = (B + 2) * S;
          [[ox, oy, -1, -1], [ox + pw * S, oy, 1, -1], [ox, oy + ph * S, -1, 1], [ox + pw * S, oy + ph * S, 1, 1]].forEach(([x, y, sx, sy]) => {
            g.appendChild(el("line", {x1: x, y1: y + sy * m, x2: x, y2: y + sy * (m + 12), stroke: "#23272D"}));
            g.appendChild(el("line", {x1: x + sx * m, y1: y, x2: x + sx * (m + 12), y2: y, stroke: "#23272D"}));
            if (B){ g.appendChild(el("line", {x1: x + sx * B * S, y1: y + sy * m, x2: x + sx * B * S, y2: y + sy * (m + 12), stroke: "#999"})); g.appendChild(el("line", {x1: x + sx * m, y1: y + sy * B * S, x2: x + sx * (m + 12), y2: y + sy * B * S, stroke: "#999"})); }
          });
        }
        g.appendChild(el("text", {x: ox + 10, y: oy + ph * S - 10, class: "g-txt2", style: "font-size:11px"}, ["text 10 mm od kraje"]));
      } else {
        // oříznutý výsledek s nepřesností řezu (posun řezu doprava a dolů)
        const dx = R * S, dy = R * S * .6;
        g.appendChild(el("rect", {x: ox - 10, y: oy - 10, width: pw * S + 20, height: ph * S + 20, fill: "#EAE4D6"}));
        const clip = el("clipPath", {id: "orez"}); clip.appendChild(el("rect", {x: ox + dx, y: oy + dy, width: pw * S, height: ph * S})); g.appendChild(clip);
        const inner = el("g", {"clip-path": "url(#orez)"});
        inner.appendChild(el("rect", {x: ox + dx, y: oy + dy, width: pw * S, height: ph * S, fill: "#fff"}));
        const ext = D ? B : 0;
        inner.appendChild(el("rect", {x: ox - ext * S, y: oy - ext * S, width: (pw + 2 * ext) * S, height: (ph * .55 + ext) * S, fill: "#B4532A"}));
        inner.appendChild(el("rect", {x: ox - ext * S, y: oy + ph * .55 * S, width: (pw + 2 * ext) * S, height: (ph * .45 + ext) * S, fill: "#FBF0C4"}));
        inner.appendChild(el("circle", {cx: ox + pw * .78 * S, cy: oy + ph * .3 * S, r: 9 * S, fill: "#C69A5B"}));
        g.appendChild(inner);
        g.appendChild(el("rect", {x: ox + dx, y: oy + dy, width: pw * S, height: ph * S, fill: "none", stroke: "#23272D", "stroke-width": 1.2}));
      }
      return g;
    }
    svg.appendChild(strana(36, 40, false));
    svg.appendChild(txt(36 + pw * S / 2, 22, "v InDesignu", "g-txt", {"text-anchor": "middle"}));
    // šipka
    svg.appendChild(el("path", {d: "M 262 105 l 28 0 l -6 -6 m 6 6 l -6 6", fill: "none", stroke: "#B4532A", "stroke-width": 2}));
    svg.appendChild(txt(276, 96, "řez", "g-txt", {"text-anchor": "middle"}));
    const g2 = strana(300, 40, true); svg.appendChild(g2);
    svg.appendChild(txt(300 + pw * S / 2, 22, "po oříznutí v tiskárně", "g-txt", {"text-anchor": "middle"}));
    const bily = R > (D ? B : 0);
    out.innerHTML = `${B ? `Spadávka <b>${B} mm</b>` : "<b>Bez spadávky</b>"}, pozadí ${D ? "dotažené" : "<b>nedotažené</b>"} za okraj, řez nepřesný o ${R} mm. ` + (bily ? `<b>Výsledek: na kraji zůstal bílý proužek.</b> ${!D ? "Pozadí končí na hraně formátu – stačí minimální odchylka řezu." : "Spadávka je menší než nepřesnost řezu – proto se používají 3 mm."}` : "<b>Výsledek v pořádku</b> – pozadí sahá až za řez, bílý okraj nevznikne.") + (Z ? "" : " Bez ořezových značek navíc tiskárna neví, kde řezat.");
  }
  [bl, dot, zn, rez].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Písmová osnova ---------- */
W.osnova = root => {
  const svg = q("svg", root), out = q("[data-out]", root);
  const base = 200, size = 150, x0 = 30;
  const FONT = `600 ${size}px "Source Serif 4",Georgia,serif`;
  function draw(){
    svg.innerHTML = "";
    // skutečné metriky písma z canvasu – linky i body sedí na reálných glyfech
    const ctx = document.createElement("canvas").getContext("2d"); ctx.font = FONT;
    const m = t => ctx.measureText(t), w = t => m(t).width;
    const xh = m("x").actualBoundingBoxAscent, cap = m("H").actualBoundingBoxAscent, asc = Math.max(m("k").actualBoundingBoxAscent, m("b").actualBoundingBoxAscent), desc = m("p").actualBoundingBoxDescent, acc = m("Š").actualBoundingBoxAscent;
    const linky = [
      ["akcentová dotažnice", base - acc, "Vymezuje výšku diakritiky nad verzálkami (Č, Š, Ž). V češtině nutná – proto mají české sazby o něco větší proklad."],
      ["horní dotažnice", base - asc, "Horní hranice horních dotahů minusek (b, d, f, h, k, l). Bývá o vlásek výš než verzálky."],
      ["verzálková dotažnice", base - cap, "Výška velkých písmen (verzálek). Stupeň písma se ale měří od horní po dolní dotažnici (kuželka)."],
      ["střední dotažnice", base - xh, "Horní hranice minusek bez dotahů (a, e, x). Vzdálenost k účaří = střední výška (x-height) – zásadní pro čitelnost."],
      ["účaří (základní dotažnice)", base, "Linka, na které písmena stojí. Oblé znaky (o, e) ji nepatrně přetahují – optická korekce, aby nevypadaly menší."],
      ["dolní dotažnice", base + desc, "Dolní hranice dolních dotahů (g, j, p, q, y)."],
    ];
    linky.forEach(([n, y, pop], i) => {
      const g = el("g", {class: "osn-l", style: "cursor:help"});
      g.appendChild(el("line", {x1: 20, y1: y, x2: 620, y2: y, stroke: "#B4532A", "stroke-width": 1, "stroke-dasharray": "5 4"}));
      g.appendChild(el("rect", {x: 20, y: y - 9, width: 600, height: 18, fill: "transparent"}));
      // popisky vpravo; u linek blízko sebe (horní × verzálková, účaří × dolní) střídavě nad/pod linkou
      const dy = (i === 2 || i === 4) ? 13 : -4;
      g.appendChild(el("text", {x: 618, y: y + dy, "text-anchor": "end", style: "font:600 12px Barlow,sans-serif;fill:#B4532A;paint-order:stroke;stroke:#fff;stroke-width:3px"}, [n]));
      g.addEventListener("mouseenter", () => { out.innerHTML = `<b>${n}</b> – ${pop}`; g.querySelector("line").setAttribute("stroke-width", 2.5); });
      g.addEventListener("mouseleave", () => g.querySelector("line").setAttribute("stroke-width", 1));
      svg.appendChild(g);
    });
    svg.appendChild(el("text", {x: x0, y: base, style: `font:${FONT};fill:#23272D`}, ["Štěpka"]));
    // části písmen – polohy odvozené ze šířek glyfů
    const X = (pre, ch, f) => x0 + w(pre) + w(ch) * f;
    const casti = [
      [X("", "Š", .5), base - cap - (acc - cap) * .5, "háček (akcent)", "Diakritické znaménko. Dosahuje k akcentové dotažnici."],
      [X("Š", "t", .42), base - xh * .5, "dřík", "Svislý hlavní tah písmene (t, l, k)."],
      [X("Štěp", "k", .2), base - 5, "serif (patka)", "Zakončení tahu u antikvy. Bezpatková písma (grotesk) je nemají."],
      [X("Ště", "p", .66), base - xh * .5, "bříško", "Uzavřený oblouk u p, b, d, a. Vnitřní prostor = oko."],
      [X("Ště", "p", .22), base + desc * .65, "dolní dotah", "Část minusky pod účařím (p, g, y)."],
      [X("Štěp", "k", .72), base - xh * .72, "rameno", "Šikmý tah vycházející z dříku (k, r)."]
    ];
    casti.forEach(([x, y, n, pop]) => {
      const g = el("g", {style: "cursor:help"});
      g.appendChild(el("circle", {cx: x, cy: y, r: 9, fill: "#38C4F0", "fill-opacity": .25, stroke: "#0F5673", "stroke-width": 1.2}));
      g.appendChild(el("circle", {cx: x, cy: y, r: 2.5, fill: "#0F5673"}));
      g.addEventListener("mouseenter", () => { out.innerHTML = `<b>${n}</b> – ${pop}`; g.querySelector("circle").setAttribute("fill-opacity", .6); });
      g.addEventListener("mouseleave", () => g.querySelector("circle").setAttribute("fill-opacity", .25));
      svg.appendChild(g);
    });
    svg.appendChild(el("line", {x1: 10, y1: base - asc, x2: 10, y2: base + desc, stroke: "#0F5673", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 4, y: base - (asc - desc) / 2, transform: `rotate(-90 4 ${base - (asc - desc) / 2})`, style: "font:600 11px Barlow,sans-serif;fill:#0F5673", "text-anchor": "middle"}, ["stupeň písma (kuželka)"]));
  }
  draw();
  if (document.fonts && document.fonts.load){ document.fonts.load(FONT).then(draw).catch(() => {}); document.fonts.ready.then(draw); }
};

/* ---------- Typografická laboratoř: kerning / tracking / leading ---------- */
W.typolab = root => {
  const stage = q("[data-stage]", root), tr = q("[data-track]", root), ld = q("[data-lead]", root), sz = q("[data-size]", root), out = q("[data-out]", root);
  let kern = "optical";
  [tr, ld, sz].forEach(bindRange);
  seg(q("[data-kern]", root), v => { kern = v; draw(); });
  function draw(){
    const T = +tr.value, L = +ld.value, S = +sz.value;
    const kernCss = kern === "none" ? "font-kerning:none" : "font-kerning:normal";
    // optický kerning simulujeme ručním vyrovnáním problémových párů
    const word = kern === "optical" ? 'A<span style="margin-left:-.07em">V</span><span style="margin-left:-.05em">A</span><span style="margin-left:-.03em">T</span><span style="margin-left:-.04em">A</span>R · T<span style="margin-left:-.06em">o</span>r<span style="margin-left:-.02em">y</span> · W<span style="margin-left:-.05em">a</span>ter' : 'AVATAR · Tory · Water';
    stage.innerHTML = `<div class="big" style="${kernCss};letter-spacing:${T / 1000}em;margin-bottom:.4em">${word}</div>
      <p style="font-size:${S}pt;line-height:${L}%;letter-spacing:${T / 1000}em;${kernCss};max-width:34em;margin:0;text-align:justify;hyphens:auto">Typografie je umění a řemeslo sazby. Dobrá sazba je neviditelná: čtenář vnímá obsah, ne písmo. Špatná sazba na sebe upozorňuje mezerami, řekami, osamělými řádky a nevyrovnanými dvojicemi písmen. Proklad, prostrkání a kerning spolu tvoří šedý tón stránky.</p>`;
    out.innerHTML = `<b>${kern === "none" ? "Kerning Žádný" : kern === "metric" ? "Metrický kerning" : "Optický kerning"}</b> – sleduj dvojice A–V, T–o, W–a v titulku.<br>Prostrkání <b>${T > 0 ? "+" : ""}${T}</b>: ${T === 0 ? "neutrální" : T < 0 ? "záporné – znaky se slévají, jen pro velké titulky" : T <= 100 ? "mírné – vhodné pro verzálkové nadpisy" : "velké – v běžném textu nepřípustné"}.<br>Proklad <b>${L} %</b> (${S}/${Math.round(S * L / 100)} pt): ${L < 110 ? "těsný, dotahy se dotýkají" : L <= 140 ? "běžný pro knižní sazbu" : L <= 170 ? "vzdušný – reklamní texty, krátké odstavce" : "příliš velký – řádky se rozpadají"}.`;
  }
  [tr, ld, sz].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Zrcadlo sazby ---------- */
W.zrcadlo = root => {
  const svg = q("svg", root), out = q("[data-out]", root);
  const I = n => q(`[data-${n}]`, root);
  const top = I("top"), bot = I("bot"), inn = I("in"), outm = I("out-m"), cols = I("cols"), gut = I("gut");
  [top, bot, inn, outm, cols, gut].forEach(bindRange);
  function draw(){
    const T = +top.value, B = +bot.value, IN = +inn.value, OU = +outm.value, C = +cols.value, G = +gut.value;
    svg.innerHTML = "";
    const S = 1.0, pw = 210, ph = 297, ox = 100, oy = 14;
    // dvoustrana: levá stránka (sudá) a pravá (lichá)
    [0, 1].forEach(k => {
      const x = ox + k * pw * S;
      svg.appendChild(el("rect", {x, y: oy, width: pw * S, height: ph * S, fill: "#fff", stroke: "#23272D"}));
      const left = k === 0 ? OU : IN, right = k === 0 ? IN : OU;
      const zx = x + left * S, zy = oy + T * S, zw = (pw - left - right) * S, zh = (ph - T - B) * S;
      svg.appendChild(el("rect", {x: zx, y: zy, width: zw, height: zh, fill: "none", stroke: "#A24BDB", "stroke-width": 1.2}));
      const cw = (zw - (C - 1) * G * S) / C;
      for (let i = 0; i < C; i++){
        const cx = zx + i * (cw + G * S);
        svg.appendChild(el("rect", {x: cx, y: zy, width: cw, height: zh, fill: "#A24BDB", "fill-opacity": .06}));
        for (let y = zy + 6; y < zy + zh - 4; y += 7){ svg.appendChild(el("rect", {x: cx + 2, y, width: cw - 4 - (y > zy + zh - 12 ? cw * .4 : 0), height: 2.2, fill: "#D8D3C8"})); }
      }
      svg.appendChild(el("text", {x: x + pw * S / 2, y: oy + ph * S - 6, "text-anchor": "middle", style: "font:600 9px Barlow,sans-serif;fill:#585E66"}, [k === 0 ? "sudá (levá) stránka" : "lichá (pravá) stránka"]));
    });
    svg.appendChild(el("line", {x1: ox + pw * S, y1: oy, x2: ox + pw * S, y2: oy + ph * S, stroke: "#23272D", "stroke-dasharray": "3 3"}));
    svg.appendChild(el("text", {x: ox + pw * S, y: oy + ph * S + 12, "text-anchor": "middle", style: "font:600 10px Barlow,sans-serif;fill:#23272D"}, ["hřbet"]));
    const lab = (x, y, t) => svg.appendChild(el("text", {x, y, style: "font:600 10px Barlow,sans-serif;fill:#A24BDB", "text-anchor": "middle"}, [t]));
    lab(ox + pw * S * 1.5, oy + T * S / 2 + 4, `${T}`); lab(ox + pw * S * 1.5, oy + ph * S - B * S / 2 + 4, `${B}`); lab(ox + pw * S + IN * S / 2 + 1, oy + ph * S / 2, `${IN}`); lab(ox + 2 * pw * S - OU * S / 2, oy + ph * S / 2, `${OU}`);
    const cw = ((pw - IN - OU) - (C - 1) * G) / C;
    const znaky = Math.round(cw / 1.75); // ~2,1 mm na znak při 9,5 pt
    out.innerHTML = `Sazební obrazec: <b>${pw - IN - OU} × ${ph - T - B} mm</b>. Šířka sloupce <b>${fmt(cw)} mm</b> ≈ ${znaky} znaků na řádek (9,5 pt). ${znaky < 35 ? "Příliš úzký sloupec – mnoho dělení slov a řeky." : znaky > 75 ? "Příliš široký řádek – oko ztrácí začátek dalšího řádku; u A4 je dvousloupcová sazba vhodnější." : "Optimální délka řádku je 45–75 znaků."}`;
  }
  [top, bot, inn, outm, cols, gut].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Skládaný průvodce A4 → A5 ---------- */
W.ohyb = root => {
  const svg = q("svg", root), oh = q("[data-ohyb]", root), vn = q("[data-vne]", root), sl = q("[data-slozeno]", root), out = q("[data-out]", root);
  [oh, vn].forEach(bindRange);
  function list(x, y, w, h, l, r, label){
    const g = el("g");
    g.appendChild(el("rect", {x: x - 6, y: y - 6, width: w + 12, height: h + 12, fill: "none", stroke: "#D33", "stroke-dasharray": "4 3"}));
    g.appendChild(el("rect", {x, y, width: w, height: h, fill: "#fff", stroke: "#23272D"}));
    const O = +oh.value * .9, V = +vn.value * .9, T = 12 * .9;
    g.appendChild(el("rect", {x: x + V, y: y + T, width: w / 2 - V - O, height: h - 2 * T, fill: "none", stroke: "#A24BDB"}));
    g.appendChild(el("rect", {x: x + w / 2 + O, y: y + T, width: w / 2 - V - O, height: h - 2 * T, fill: "none", stroke: "#A24BDB"}));
    g.appendChild(el("rect", {x: x + w / 2 - O, y, width: 2 * O, height: h, fill: "#F1DDD0", "fill-opacity": .6}));
    g.appendChild(el("line", {x1: x + w / 2, y1: y - 10, x2: x + w / 2, y2: y + h + 10, stroke: "#B4532A", "stroke-dasharray": "6 3", "stroke-width": 1.5}));
    g.appendChild(el("text", {x: x + w / 4, y: y + h / 2 + 10, "text-anchor": "middle", style: "font:800 30px Barlow Condensed,sans-serif;fill:#23272D"}, [l]));
    g.appendChild(el("text", {x: x + 3 * w / 4, y: y + h / 2 + 10, "text-anchor": "middle", style: "font:800 30px Barlow Condensed,sans-serif;fill:#23272D"}, [r]));
    g.appendChild(el("text", {x: x + w / 2, y: y + h + 24, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, [label]));
    return g;
  }
  function draw(){
    svg.innerHTML = "";
    const w = 267, h = 189;
    if (!sl.checked){
      svg.appendChild(list(30, 30, w, h, "4", "1", "LÍC archu A4 (297 × 210 mm)"));
      svg.appendChild(list(340, 30, w, h, "2", "3", "RUB archu A4"));
      out.innerHTML = `Oranžový pás = zóna ohybu ±${oh.value} mm, kam nepatří text ani důležitá grafika. Fialově sazební obrazce čtyř stránek A5. Vnější okraj ${vn.value} mm. Součet protilehlých stránek na archu je vždy 5.`;
    } else {
      const pw = 133, ph = 189;
      ["1", "2", "3", "4"].forEach((n, i) => {
        const x = 40 + i * 150;
        svg.appendChild(el("rect", {x, y: 30, width: pw, height: ph, fill: "#fff", stroke: "#23272D"}));
        const O = +oh.value * .9, V = +vn.value * .9, T = 12 * .9, leva = (i === 1 || i === 3); // u ohybu vlevo u 1 a 3? strana 1 má ohyb vlevo (titul vpravo na archu)
        const ohybVlevo = (n === "1" || n === "3");
        svg.appendChild(el("rect", {x: x + (ohybVlevo ? O : V), y: 30 + T, width: pw - O - V, height: ph - 2 * T, fill: "none", stroke: "#A24BDB"}));
        svg.appendChild(el("line", {x1: ohybVlevo ? x : x + pw, y1: 30, x2: ohybVlevo ? x : x + pw, y2: 30 + ph, stroke: "#B4532A", "stroke-width": 3}));
        svg.appendChild(el("text", {x: x + pw / 2, y: 30 + ph / 2 + 10, "text-anchor": "middle", style: "font:800 30px Barlow Condensed,sans-serif;fill:#23272D"}, [n]));
        svg.appendChild(el("text", {x: x + pw / 2, y: 30 + ph + 24, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, [n === "1" ? "titul (líc, vpravo)" : n === "4" ? "zadní (líc, vlevo)" : "vnitřní (rub)"]));
      });
      out.innerHTML = `Po složení: čtyři stránky A5 (148,5 × 210 mm) v pořadí 1–2–3–4. Hnědá linka = hřbet (ohyb). Vnitřní okraj u ohybu ${oh.value} mm, vnější ${vn.value} mm.`;
    }
  }
  [oh, vn, sl].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Archová montáž V1 ---------- */
W.montaz = root => {
  const svg = q("svg", root), out = q("[data-out]", root);
  let N = 8;
  seg(q("[data-n]", root), v => { N = +v; draw(); });
  function draw(){
    svg.innerHTML = "";
    const listy = N / 4; // každý list A3 = 4 stránky
    const W = 118, H = 84, gapx = 14, gapy = 34;
    const cols = Math.min(listy, 2);
    const txtS = "font:800 26px Barlow Condensed,sans-serif;fill:#23272D";
    const popis = [];
    for (let l = 0; l < listy; l++){
      // list l: líc: (N - 2l) | (1 + 2l); rub: (2 + 2l) | (N - 1 - 2l)
      const lic = [N - 2 * l, 1 + 2 * l], rub = [2 + 2 * l, N - 1 - 2 * l];
      popis.push(`list ${l + 1}: líc ${lic[0]}|${lic[1]}, rub ${rub[0]}|${rub[1]}`);
      [lic, rub].forEach((pair, side) => {
        const x = 20 + (l % 2) * (2 * W + gapx + 44) + side * (W + gapx), y = 16 + Math.floor(l / 2) * (H + gapy + 16);
        svg.appendChild(el("rect", {x, y, width: W, height: H, fill: side ? "#F4F0E7" : "#fff", stroke: "#23272D"}));
        svg.appendChild(el("line", {x1: x + W / 2, y1: y, x2: x + W / 2, y2: y + H, stroke: "#B4532A", "stroke-dasharray": "4 3"}));
        svg.appendChild(el("text", {x: x + W / 4, y: y + H / 2 + 9, "text-anchor": "middle", style: txtS}, [String(pair[0])]));
        svg.appendChild(el("text", {x: x + 3 * W / 4, y: y + H / 2 + 9, "text-anchor": "middle", style: txtS}, [String(pair[1])]));
        svg.appendChild(el("text", {x: x + W / 2, y: y + H + 16, "text-anchor": "middle", style: "font:600 11px Barlow,sans-serif;fill:#585E66"}, [`list ${l + 1} – ${side ? "rub" : "líc"} (A3)`]));
      });
    }
    out.innerHTML = `<b>${N} stran = ${listy} list${listy === 1 ? "" : listy < 5 ? "y" : "ů"} A3</b>, každý přeložený napůl (4 stránky A5). Listy se vkládají do sebe a sešívají ve hřbetu (V1).<br>${popis.join("<br>")}<br>Kontrola: součet dvojice = ${N + 1}.`;
  }
  draw();
};

/* ---------- DL leták ---------- */
W.dl = root => {
  const svg = q("svg", root), ok = q("[data-okraj]", root), slz = q("[data-slozeny]", root), out = q("[data-out]", root);
  let typ = "C"; bindRange(ok);
  seg(q("[data-typ]", root), v => { typ = v; draw(); });
  function arch(x, y, S, sirky, nazvy, label){
    const g = el("g"); const h = 210 * S; let cx = x;
    g.appendChild(el("rect", {x: x - 3 * S, y: y - 3 * S, width: 297 * S + 6 * S, height: h + 6 * S, fill: "none", stroke: "#D33", "stroke-dasharray": "4 3"}));
    sirky.forEach((w, i) => {
      g.appendChild(el("rect", {x: cx, y, width: w * S, height: h, fill: ["#fff", "#FBF8F1", "#F4F0E7"][i], stroke: "#23272D"}));
      const O = +ok.value * S;
      g.appendChild(el("rect", {x: cx + O, y: y + O, width: w * S - 2 * O, height: h - 2 * O, fill: "none", stroke: "#A24BDB"}));
      g.appendChild(el("text", {x: cx + w * S / 2, y: y + h / 2 - 6, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#23272D"}, [nazvy[i]]));
      g.appendChild(el("text", {x: cx + w * S / 2, y: y + h / 2 + 10, "text-anchor": "middle", style: "font:600 11px Barlow,sans-serif;fill:#B4532A"}, [`${w} mm`]));
      if (i < 2){ cx += w * S; g.appendChild(el("line", {x1: cx, y1: y - 10, x2: cx, y2: y + h + 10, stroke: "#B4532A", "stroke-dasharray": "5 3", "stroke-width": 1.5})); }
    });
    g.appendChild(el("text", {x: x + 297 * S / 2, y: y + h + 26, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, [label]));
    return g;
  }
  function draw(){
    svg.innerHTML = "";
    const S = 0.95;
    if (!slz.checked){
      const lic = typ === "C" ? [100, 99, 98] : [99, 99, 99], rub = typ === "C" ? [98, 99, 100] : [99, 99, 99];
      const nl = typ === "C" ? ["zadní strana", "vnitřní zahnutý", "přední obálka"] : ["panel 6", "panel 1 (obálka)", "panel 2"];
      const nr = typ === "C" ? ["vnitřek 1", "vnitřek 2", "vnitřek 3"] : ["panel 3", "panel 4", "panel 5"];
      svg.appendChild(arch(20, 20, S, lic, nl, "LÍC A4 (297 × 210 mm)"));
      svg.appendChild(arch(330, 20, S, rub, nr, "RUB A4"));
      out.innerHTML = typ === "C" ? `<b>Zavinutý sklad</b>: panely 100 – 99 – 98 mm (líc), na rubu zrcadlově 98 – 99 – 100. Nejužší panel se zasouvá dovnitř. Fialově textové okraje ${ok.value} mm od ohybu i od kraje. Červeně spadávka 3 mm.` : `<b>Harmonikový sklad</b>: všechny panely 99 mm, nic se nezasouvá. Pořadí panelů po rozložení jde za sebou.`;
    } else {
      const w = (typ === "C" ? 99 : 99) * 2, h = 210 * 2 * .62;
      svg.appendChild(el("rect", {x: 60, y: 30, width: w * .62, height: h, fill: "#fff", stroke: "#23272D"}));
      svg.appendChild(el("rect", {x: 60 + (+ok.value) * 1.24, y: 30 + (+ok.value) * 1.24, width: w * .62 - (+ok.value) * 2.48, height: h - (+ok.value) * 2.48, fill: "none", stroke: "#A24BDB"}));
      svg.appendChild(el("rect", {x: 60, y: 30, width: w * .62, height: h * .4, fill: "#B4532A"}));
      svg.appendChild(el("text", {x: 60 + w * .31, y: 30 + h * .55, "text-anchor": "middle", style: "font:800 20px Barlow Condensed,sans-serif;fill:#23272D"}, ["TITULEK"]));
      svg.appendChild(el("text", {x: 60 + w * .31, y: 30 + h + 20, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, ["složený leták 99 × 210 mm (přední obálka)"]));
      svg.appendChild(el("rect", {x: 260, y: 60, width: 220, height: 110, fill: "#FBF8F1", stroke: "#23272D"}));
      svg.appendChild(el("rect", {x: 280, y: 85, width: 180, height: 60, fill: "#fff", stroke: "#23272D", "stroke-dasharray": "3 2"}));
      svg.appendChild(el("text", {x: 370, y: 120, "text-anchor": "middle", style: "font:600 11px Barlow,sans-serif;fill:#585E66"}, ["okénko"]));
      svg.appendChild(el("text", {x: 370, y: 190, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, ["obálka DL 110 × 220 mm"]));
      out.innerHTML = "Složený leták (třetina A4, cca 99–100 × 210 mm) se vejde do obálky DL 110 × 220 mm – proto se mu říká DL leták.";
    }
  }
  [ok, slz].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Ochranná zóna loga ---------- */
W.ochranna = root => {
  const svg = q("svg", root), zo = q("[data-zona]", root), ve = q("[data-vel]", root), sit = q("[data-sit]", root), ru = q("[data-rusivy]", root), out = q("[data-out]", root);
  [zo, ve].forEach(bindRange);
  function logo(g, x, y, s){
    // jednoduché fiktivní logo: symbol (dva oblouky) + logotyp "ORBIS"
    g.appendChild(el("circle", {cx: x + 1.5 * s, cy: y + 1.5 * s, r: 1.4 * s, fill: "#0F5673"}));
    g.appendChild(el("circle", {cx: x + 1.9 * s, cy: y + 1.2 * s, r: .9 * s, fill: "#F4F0E7"}));
    g.appendChild(el("text", {x: x + 3.4 * s, y: y + 2.3 * s, style: `font:800 ${2.2 * s}px Barlow Condensed,sans-serif;fill:#23272D;letter-spacing:${.06 * s}px`}, ["ORBIS"]));
  }
  function draw(){
    svg.innerHTML = "";
    const Z = +zo.value, V = +ve.value;
    const s = Math.max(6, V * .45); // jednotka x v px
    const lw = 3.4 * s + 2.2 * s * 2.75, lh = 3 * s; // rozměr loga
    const x = 320 - lw / 2, y = 150 - lh / 2;
    if (sit.checked){
      for (let i = -3; i <= Math.ceil(lw / s) + 3; i++) svg.appendChild(el("line", {x1: x + i * s, y1: y - 3 * s, x2: x + i * s, y2: y + lh + 3 * s, stroke: "#38C4F0", "stroke-opacity": .35}));
      for (let j = -3; j <= 6; j++) svg.appendChild(el("line", {x1: x - 3 * s, y1: y + j * s, x2: x + lw + 3 * s, y2: y + j * s, stroke: "#38C4F0", "stroke-opacity": .35}));
    }
    svg.appendChild(el("rect", {x: x - Z * s, y: y - Z * s, width: lw + 2 * Z * s, height: lh + 2 * Z * s, fill: "#F1DDD0", "fill-opacity": .5, stroke: "#B4532A", "stroke-dasharray": "5 3"}));
    const g = el("g"); logo(g, x, y, s); svg.appendChild(g);
    svg.appendChild(el("text", {x: x - Z * s, y: y - Z * s - 6, style: "font:600 11px Barlow,sans-serif;fill:#B4532A"}, [`ochranná zóna ${Z}x`]));
    svg.appendChild(el("line", {x1: x + lw + Z * s + 10, y1: y, x2: x + lw + Z * s + 10, y2: y + s, stroke: "#0F5673", "stroke-width": 2}));
    svg.appendChild(el("text", {x: x + lw + Z * s + 16, y: y + s * .7, style: "font:700 12px Barlow,sans-serif;fill:#0F5673"}, ["x"]));
    if (ru.checked){
      const rx = x + lw + Z * s * .4;
      svg.appendChild(el("rect", {x: rx, y: y - 10, width: 90, height: lh + 20, fill: "#C8257A", "fill-opacity": .8}));
      svg.appendChild(el("text", {x: rx + 45, y: y + lh / 2 + 5, "text-anchor": "middle", style: "font:700 12px Barlow,sans-serif;fill:#fff"}, ["AKCE −50 %"]));
      svg.appendChild(el("text", {x: rx + 45, y: y + lh + 28, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#A33"}, ["✗ zasahuje do zóny"]));
    }
    svg.appendChild(el("text", {x: 320, y: 285, "text-anchor": "middle", style: "font:600 12px Barlow,sans-serif;fill:#585E66"}, [`šířka loga ${V} mm`]));
    const min = 20;
    out.innerHTML = `Jednotka <b>x</b> = výška písmene logotypu; ochranná zóna <b>${Z}x</b> na každou stranu. ${V < min ? `<b>Logo je menší než minimální velikost ${min} mm</b> – detaily symbolu se v tisku slijí; použij zjednodušenou variantu.` : `Velikost ${V} mm je nad minimem ${min} mm.`}${ru.checked ? " Cizí prvek v ochranné zóně je porušení manuálu." : ""}`;
  }
  [zo, ve, sit, ru].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Bitmapa × vektor ---------- */
W.bitvek = root => {
  const svg = q("svg", root), zo = q("[data-zoom]", root), re = q("[data-res]", root), out = q("[data-out]", root);
  [zo, re].forEach(bindRange);
  // tvar: kruh s výsečí + písmeno
  function inside(x, y){ // x,y v 0..1
    const dx = x - .5, dy = y - .5, r = Math.hypot(dx, dy);
    if (r < .42 && r > .22) { const a = Math.atan2(dy, dx); return a > -2.2 && a < 2.2; }
    if (Math.abs(dx) < .06 && dy > -.15 && dy < .35) return true;
    return false;
  }
  function draw(){
    svg.innerHTML = "";
    const Z = +zo.value, N = +re.value, size = 240, s = size / N;
    // bitmapa vlevo (okno 240×240 ukazuje výřez při zvětšení)
    const g1 = el("g", {transform: "translate(40 30)"});
    g1.appendChild(el("rect", {width: size, height: size, fill: "#fff", stroke: "#23272D"}));
    const clip = el("clipPath", {id: "cl"}); clip.appendChild(el("rect", {width: size, height: size})); g1.appendChild(clip);
    const gg = el("g", {"clip-path": "url(#cl)"});
    const view = 1 / Z, ox = .5 - view / 2, oy = .5 - view / 2; // výřez kolem středu
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++){
      const px = (i + .5) / N, py = (j + .5) / N;
      if (px < ox - 1 / N || px > ox + view + 1 / N || py < oy - 1 / N || py > oy + view + 1 / N) continue;
      const on = inside(px, py);
      gg.appendChild(el("rect", {x: (i / N - ox) * Z * size, y: (j / N - oy) * Z * size, width: s * Z + .5, height: s * Z + .5, fill: on ? "#B4532A" : "#F4F0E7"}));
    }
    g1.appendChild(gg); svg.appendChild(g1);
    svg.appendChild(el("text", {x: 160, y: 288, "text-anchor": "middle", style: "font:700 13px Barlow Condensed,sans-serif;fill:#585E66"}, [`BITMAPA ${N} × ${N} px, zvětšení ${Z}×`]));
    // vektor vpravo
    const g2 = el("g", {transform: "translate(360 30)"});
    g2.appendChild(el("rect", {width: size, height: size, fill: "#fff", stroke: "#23272D"}));
    const clip2 = el("clipPath", {id: "cl2"}); clip2.appendChild(el("rect", {width: size, height: size})); g2.appendChild(clip2);
    const gclip = el("g", {"clip-path": "url(#cl2)"});
    const gv = el("g", {transform: `translate(${size / 2} ${size / 2}) scale(${Z}) translate(${-size / 2} ${-size / 2})`});
    const R1 = .42 * size, R2 = .22 * size, c = size / 2, a = 2.2;
    const p = (r, t) => `${c + r * Math.cos(t)} ${c + r * Math.sin(t)}`;
    gv.appendChild(el("path", {d: `M ${p(R1, -a)} A ${R1} ${R1} 0 1 1 ${p(R1, a)} L ${p(R2, a)} A ${R2} ${R2} 0 1 0 ${p(R2, -a)} Z`, fill: "#0F5673"}));
    gv.appendChild(el("rect", {x: c - .06 * size, y: c - .15 * size, width: .12 * size, height: .5 * size, fill: "#0F5673"}));
    gclip.appendChild(gv); g2.appendChild(gclip); svg.appendChild(g2);
    svg.appendChild(el("text", {x: 480, y: 288, "text-anchor": "middle", style: "font:700 13px Barlow Condensed,sans-serif;fill:#585E66"}, [`VEKTOR – křivky, zvětšení ${Z}×`]));
    out.innerHTML = `Bitmapa má <b>${N * N}</b> pixelů; při ${Z}× zvětšení vidíš jednotlivé čtverce. Vektor je popsaný dvěma křivkami a obdélníkem – ostrý při libovolném zvětšení. ${N >= 48 ? "Vyšší rozlišení pixelizaci jen oddálí – a soubor roste s druhou mocninou." : "Zvyš rozlišení a sleduj, jak roste počet pixelů."}`;
  }
  [zo, re].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Poradce formátu ---------- */
W.formatvyber = root => {
  const co = q("[data-co]", root), out = q("[data-out]", root); let kam = "tisk";
  seg(q("[data-kam]", root), v => { kam = v; draw(); });
  const T = {
    foto: {tisk: "<b>TIFF</b> (LZW) nebo <b>JPEG kvalita 12</b>, CMYK (Coated FOGRA39), 300 ppi při výsledné velikosti. Do InDesignu umístit, ne vkládat.", web: "<b>JPEG</b> kvalita 60–80 % v sRGB, rozměr podle místa na stránce (např. 1600 px na šířku), nebo <b>WebP</b>. Bez CMYK, bez vysokého ppi.", prace: "<b>PSD</b> nebo <b>TIFF</b> s vrstvami, 16 bit, bezztrátově; z fotoaparátu <b>RAW</b> → Camera Raw."},
    logo: {tisk: "<b>PDF</b> (PDF/X, CMYK, text v křivkách) nebo <b>EPS</b>; zdroj v <b>AI</b>. Nikdy JPEG/PNG.", web: "<b>SVG</b> (text převedený na obrysy) – ostré v každé velikosti; záložně <b>PNG-24</b> s průhledností ve 2× velikosti pro Retina.", prace: "<b>AI</b> (plátna pro varianty, symboly, vrstvy)."},
    pruhled: {tisk: "<b>PSD</b> nebo <b>TIFF s alfa kanálem</b> v CMYK – InDesign průhlednost zachová. <b>PNG do tisku nepatří</b> (jen RGB).", web: "<b>PNG-24</b> (8bitová alfa, poloprůhlednost) nebo <b>WebP</b>; <b>PNG-8/GIF</b> jen pro tvrdou 1bitovou průhlednost.", prace: "<b>PSD</b> s maskou vrstvy (ne vymazané pixely – maska je vratná)."},
    anim: {tisk: "Animaci vytisknout nelze – pro tisk jeden snímek jako TIFF/PDF.", web: "<b>GIF</b> (256 barev, smyčka; bannery, drobné animace) nebo <b>MP4 h.264</b> / animované <b>WebP</b> pro kvalitnější barvy a menší soubor.", prace: "<b>PSD</b> s časovou osou (snímková animace) nebo projekt After Effects / Animate."},
    sazba: {tisk: "<b>PDF/X-1a</b> (nebo PDF/X-4) s ořezovými značkami, spadávkou a výstupním profilem Coated FOGRA39; po stránkách.", web: "<b>PDF optimalizované pro web</b> (nejmenší velikost, RGB, 100–150 ppi, bez značek) nebo <b>interaktivní PDF</b>; pro čtečky <b>ePub</b>.", prace: "<b>INDD</b> sbalený (Soubor › Sbalit) včetně Links a Document fonts; pro starší verze <b>IDML</b>."},
    malba: {tisk: "<b>TIFF</b> nebo <b>PSD</b> zploštělé, CMYK, 300 ppi, A3 – zachová vše pro tiskovou reprodukci.", web: "<b>JPEG</b> sRGB zmenšený na 1920 px, případně PNG pro ostrou grafiku.", prace: "<b>PSD</b> s vrstvami a vlastními štětci (uložit .abr), 16 bit pro plynulé přechody."},
    archiv: {tisk: "Pro tisk PDF/X; pro archiv <b>PDF/A</b> – vložená písma, bez šifrování, bez JavaScriptu, s metadaty.", web: "<b>PDF/A</b> (dlouhodobě čitelné) nebo optimalizované PDF.", prace: "Originály (INDD/AI/PSD) + <b>PDF/A</b> jako konečná verze; <b>TIFF</b> pro skeny."},
  };
  function draw(){ out.innerHTML = T[co.value][kam]; }
  co.addEventListener("input", draw); draw();
};

/* ---------- Laboratoř barev: RGB → CMYK, HSB, Lab ---------- */
W.barvy = root => {
  const stage = q("[data-stage]", root), out = q("[data-out]", root), R = q("[data-r]", root), G = q("[data-g]", root), B = q("[data-b]", root);
  [R, G, B].forEach(bindRange);
  qa("[data-set]", root).forEach(b => b.addEventListener("click", () => { const [r, g, bb] = b.dataset.set.split(",").map(Number); R.value = r; G.value = g; B.value = bb; [R, G, B].forEach(i => i.dispatchEvent(new Event("input"))); }));
  function rgb2cmyk(r, g, b){ const k = 1 - Math.max(r, g, b) / 255; if (k === 1) return [0, 0, 0, 100]; const c = (1 - r / 255 - k) / (1 - k), m = (1 - g / 255 - k) / (1 - k), y = (1 - b / 255 - k) / (1 - k); return [c, m, y, k].map(v => Math.round(v * 100)); }
  function rgb2hsb(r, g, b){ r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d){ if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h = Math.round(h * 60); if (h < 0) h += 360; } return [h, Math.round(mx ? d / mx * 100 : 0), Math.round(mx * 100)]; }
  function rgb2lab(r, g, b){
    const f = v => { v /= 255; return v > .04045 ? Math.pow((v + .055) / 1.055, 2.4) : v / 12.92; };
    r = f(r); g = f(g); b = f(b);
    let x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = (r * .2126 + g * .7152 + b * .0722), z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
    const t = v => v > .008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116;
    x = t(x); y = t(y); z = t(z);
    return [Math.round(116 * y - 16), Math.round(500 * (x - y)), Math.round(200 * (y - z))];
  }
  function draw(){
    const r = +R.value, g = +G.value, b = +B.value;
    const [c, m, y, k] = rgb2cmyk(r, g, b), [h, sat, br] = rgb2hsb(r, g, b), [L, a, bb] = rgb2lab(r, g, b);
    // odhad "mimo gamut": velmi syté RGB barvy (sytost vysoká a jas vysoký) nejdou v CMYK
    const mimo = sat > 75 && br > 60 && ((h > 90 && h < 170) || (h > 220 && h < 290) || (h >= 20 && h < 45));
    // přibližná tisková simulace: posun k méně sytému
    const sim = mimo ? `rgb(${Math.round(r * .75 + 40)},${Math.round(g * .75 + 40)},${Math.round(b * .75 + 40)})` : `rgb(${r},${g},${b})`;
    const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    stage.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div><div style="height:150px;border-radius:8px;background:rgb(${r},${g},${b});border:1px solid #ccc"></div><p style="margin:6px 0 0;font:600 13px Barlow,sans-serif;color:#585E66">na obrazovce (sRGB)</p></div>
      <div><div style="height:150px;border-radius:8px;background:${sim};border:1px solid #ccc"></div><p style="margin:6px 0 0;font:600 13px Barlow,sans-serif;color:#585E66">simulace tisku CMYK ${mimo ? "– <b style='color:#A33'>mimo gamut</b>" : "– v gamutu"}</p></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px;font-family:Barlow,sans-serif">
      <div class="readout"><b>RGB</b><br>${r}, ${g}, ${b}<br>${hex}</div>
      <div class="readout"><b>CMYK</b><br>${c} / ${m} / ${y} / ${k} %</div>
      <div class="readout"><b>HSB</b><br>${h}° / ${sat} % / ${br} %</div>
      <div class="readout"><b>Lab</b><br>L ${L} · a ${a} · b ${bb}</div>
    </div>`;
    // kanály
    const ch = (lbl, v, col) => `<div style="text-align:center"><div style="height:40px;border-radius:4px;background:linear-gradient(90deg,#000,${col});position:relative"><i style="position:absolute;top:-4px;bottom:-4px;left:calc(${v / 255 * 100}% - 1px);width:2px;background:#fff;outline:1px solid #000"></i></div><small>${lbl} ${v}</small></div>`;
    stage.insertAdjacentHTML("beforeend", `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px;font:600 12px Barlow,sans-serif">${ch("R", r, "#f00")}${ch("G", g, "#0f0")}${ch("B", b, "#00f")}</div>`);
    out.innerHTML = `${sat === 0 ? "<b>Sytost 0 %</b> – neutrální šedá: R = G = B, v CMYK jen K (nebo vyvážené CMY)." : br === 100 && sat === 100 ? "<b>Čistá primární barva světla</b> – v CMYK se tiskne dvěma barvivy, nikdy stejně sytě." : "Odstín určuje, jaká barva to je; sytost, kolik je v ní šedi; jas, kolik světla."} ${mimo ? "Takto sytou barvu CMYK Coated FOGRA39 nevytiskne – posune se (relativní kolorimetrický záměr) nebo se celý obraz stlačí (perceptuální)." : ""}`;
  }
  [R, G, B].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Cestář ---------- */
W.cestar = root => {
  const svg = q("svg", root), out = q("[data-out]", root);
  let op = "none";
  seg(q("[data-op]", root), v => { op = v; draw(); });
  const C = {cx: 290, cy: 150, r: 85}, R = {x: 290, y: 95, w: 150, h: 120}; // kruh vzadu (modrý), obdélník vpředu (oranžový)
  const popis = {
    none: "Dva objekty: kruh vzadu (modrý) a obdélník vpředu (oranžový). Vyber oba a klikni na operaci Cestáře.",
    unite: "<b>Sjednotit</b> (Unite): vznikne jeden objekt s barvou předního. Základ každého loga z geometrie.",
    minus: "<b>Odečíst přední</b> (Minus Front): přední objekt (obdélník) vyřízne díru do zadního (kruhu) a zmizí.",
    intersect: "<b>Průsečík</b> (Intersect): zůstane jen plocha, kde se objekty překrývaly.",
    exclude: "<b>Vyloučit</b> (Exclude): překryv zmizí, zbytek obou objektů zůstane jako složená cesta.",
    divide: "<b>Rozdělit</b> (Divide): každá překrývající se oblast se stane samostatným objektem (skupina) – pak lze obarvit zvlášť."
  };
  function draw(){
    svg.innerHTML = "";
    const defs = el("defs");
    const circ = () => el("circle", {cx: C.cx, cy: C.cy, r: C.r});
    const rect = () => el("rect", {x: R.x, y: R.y, width: R.w, height: R.h});
    const cp1 = el("clipPath", {id: "cpC"}); cp1.appendChild(circ()); defs.appendChild(cp1);
    const cp2 = el("clipPath", {id: "cpR"}); cp2.appendChild(rect()); defs.appendChild(cp2);
    const m = el("mask", {id: "mR"}); m.appendChild(el("rect", {x: 0, y: 0, width: 640, height: 300, fill: "#fff"})); const rr = rect(); rr.setAttribute("fill", "#000"); m.appendChild(rr); defs.appendChild(m);
    const mC = el("mask", {id: "mC"}); mC.appendChild(el("rect", {x: 0, y: 0, width: 640, height: 300, fill: "#fff"})); const cc = circ(); cc.setAttribute("fill", "#000"); mC.appendChild(cc); defs.appendChild(mC);
    svg.appendChild(defs);
    const blue = "#0F5673", or = "#B4532A", st = {stroke: "#23272D", "stroke-width": 1.5};
    const add = (e, fill, extra = {}) => { e.setAttribute("fill", fill); for (const k in st) e.setAttribute(k, st[k]); for (const k in extra) e.setAttribute(k, extra[k]); svg.appendChild(e); return e; };
    if (op === "none"){ add(circ(), blue); add(rect(), or); }
    else if (op === "unite"){ add(circ(), or, {stroke: "none"}); add(rect(), or, {stroke: "none"}); const o1 = circ(); o1.setAttribute("fill", "none"); o1.setAttribute("stroke", "#23272D"); o1.setAttribute("stroke-width", 1.5); o1.setAttribute("mask", "url(#mR)"); svg.appendChild(o1); const o2 = rect(); o2.setAttribute("fill", "none"); o2.setAttribute("stroke", "#23272D"); o2.setAttribute("stroke-width", 1.5); o2.setAttribute("mask", "url(#mC)"); svg.appendChild(o2); }
    else if (op === "minus"){ const c = circ(); c.setAttribute("mask", "url(#mR)"); add(c, blue); }
    else if (op === "intersect"){ const c = circ(); c.setAttribute("clip-path", "url(#cpR)"); add(c, or); }
    else if (op === "exclude"){ const c = circ(); c.setAttribute("mask", "url(#mR)"); add(c, or); const r = rect(); r.setAttribute("mask", "url(#mC)"); add(r, or); }
    else if (op === "divide"){ const c = circ(); c.setAttribute("mask", "url(#mR)"); add(c, blue); const r = rect(); r.setAttribute("mask", "url(#mC)"); add(r, or); const i = circ(); i.setAttribute("clip-path", "url(#cpR)"); add(i, "#C69A5B"); }
    svg.appendChild(el("text", {x: 320, y: 285, "text-anchor": "middle", style: "font:600 12px Barlow,sans-serif;fill:#585E66"}, [op === "none" ? "kruh (zadní) + obdélník (přední)" : "výsledek operace"]));
    out.innerHTML = popis[op];
  }
  draw();
};

/* ---------- Varianty loga ---------- */
W.varianty = root => {
  const stage = q("[data-stage]", root), out = q("[data-out]", root);
  let v = "color", bg = "#fff";
  seg(q("[data-var]", root), x => { v = x; draw(); });
  seg(q("[data-bg]", root), x => { bg = x; draw(); });
  function logo(c1, c2, txt){
    return `<svg viewBox="0 0 230 90" style="width:100%;max-width:420px;height:auto"><rect x="8" y="12" width="66" height="66" rx="12" fill="${c1}"/><circle cx="41" cy="45" r="22" fill="${bg}"/><path d="M33 34 l21 10 -9 3 -3 9z" fill="${c2}"/><text x="88" y="58" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="40" fill="${txt}" letter-spacing="2">PIXA</text></svg>`;
  }
  const popisy = {
    color: "Základní barevná varianta: symbol v firemní modré, kurzor v oranžové, logotyp černý. Použití na světlých podkladech.",
    gray: "Stupně šedi: barvy nahrazené šedou o stejném jasu. Pro černobílý tisk (noviny, kopie). Pozor: oranžová a modrá mají podobný jas – kurzor splývá; v manuálu se jeho šeď upraví.",
    mono: "Monochromatická: celé logo v jedné (firemní) barvě. Jednobarevný tisk, sítotisk, razítko, aplikace na firemní pozadí v tónech.",
    bw: "Černobílá: 100 % K, žádné tóny. Fax, gravírování, pískování, řezaná fólie, výšivka. Nejodolnější varianta.",
    inv: "Černobílá inverzní (negativ): bílé logo pro tmavé podklady. Není to Invertovat barvy – podklad je součástí aplikace."
  };
  function draw(){
    const dark = bg === "#111" || bg === "#0F5673";
    let h;
    if (v === "color") h = logo("#0F5673", "#B4532A", dark ? "#fff" : "#23272D");
    else if (v === "gray") h = logo("#4a4a4a", "#7a7a7a", dark ? "#ddd" : "#222");
    else if (v === "mono") h = logo(dark ? "#8fd0ea" : "#0F5673", dark ? "#8fd0ea" : "#0F5673", dark ? "#8fd0ea" : "#0F5673");
    else if (v === "bw") h = logo("#000", "#000", "#000");
    else h = logo("#fff", "#fff", "#fff");
    stage.innerHTML = `<div style="background:${bg};padding:30px;border-radius:8px;border:1px solid #ccc;display:flex;justify-content:center">${h}</div>`;
    let pozn = "";
    if (v === "bw" && dark) pozn = " <b style='color:#A33'>Na tmavém podkladu je pozitivní ČB varianta neviditelná – použij inverzní.</b>";
    if (v === "inv" && !dark) pozn = " <b style='color:#A33'>Na světlém podkladu je negativ neviditelný – použij pozitivní variantu.</b>";
    if (v === "color" && bg === "#0F5673") pozn = " <b style='color:#A33'>Symbol splývá s firemním pozadím – tady patří inverzní nebo bílá varianta.</b>";
    out.innerHTML = popisy[v] + pozn;
  }
  draw();
};

/* ---------- Vzorek (pattern) ---------- */
W.vzorek = root => {
  const svg = q("svg", root), vel = q("[data-vel]", root), out = q("[data-out]", root);
  let typ = "grid", motiv = "strom"; bindRange(vel);
  seg(q("[data-typ]", root), v => { typ = v; draw(); });
  seg(q("[data-motiv]", root), v => { motiv = v; draw(); });
  function motivEl(size){
    const g = el("g"); const s = size;
    if (motiv === "strom"){ g.appendChild(el("path", {d: `M ${s * .5} ${s * .15} L ${s * .8} ${s * .65} L ${s * .2} ${s * .65} Z`, fill: "#4E7A45"})); g.appendChild(el("rect", {x: s * .44, y: s * .65, width: s * .12, height: s * .2, fill: "#6B4122"})); }
    else if (motiv === "vlna"){ g.appendChild(el("path", {d: `M 0 ${s * .5} Q ${s * .25} ${s * .3} ${s * .5} ${s * .5} T ${s} ${s * .5}`, fill: "none", stroke: "#0F5673", "stroke-width": Math.max(1.5, s * .06)})); }
    else { g.appendChild(el("line", {x1: 0, y1: s, x2: s, y2: 0, stroke: "#4E7A45", "stroke-width": Math.max(1, s * .05)})); }
    return g;
  }
  function draw(){
    svg.innerHTML = "";
    const S = +vel.value;
    // dlaždice vlevo
    svg.appendChild(el("rect", {x: 30, y: 60, width: S * 2.2, height: S * 2.2, fill: "#fff", stroke: "#23272D", "stroke-dasharray": "4 3"}));
    const g = el("g", {transform: `translate(${30 + S * .6} ${60 + S * .6})`}); g.appendChild(motivEl(S)); svg.appendChild(g);
    svg.appendChild(el("rect", {x: 30 + S * .6, y: 60 + S * .6, width: S, height: S, fill: "none", stroke: "#B4532A"}));
    svg.appendChild(el("text", {x: 30 + S * 1.1, y: 60 + S * 2.2 + 18, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, ["dlaždice (oranžově okraj)"]));
    // plocha vpravo
    const defs = el("defs");
    const pw = typ === "hex" ? S * 1.5 : S, ph = typ === "hex" ? S * .87 * 2 : S;
    const pat = el("pattern", {id: "pat13", patternUnits: "userSpaceOnUse", width: typ === "brick" ? S : pw, height: typ === "brick" ? S * 2 : ph});
    if (typ === "grid"){ pat.appendChild(motivEl(S)); }
    else if (typ === "brick"){ pat.appendChild(motivEl(S)); const g2 = el("g", {transform: `translate(${S / 2} ${S})`}); g2.appendChild(motivEl(S)); pat.appendChild(g2); const g3 = el("g", {transform: `translate(${-S / 2} ${S})`}); g3.appendChild(motivEl(S)); pat.appendChild(g3); }
    else { pat.appendChild(motivEl(S)); const g2 = el("g", {transform: `translate(${S * .75} ${S * .87})`}); g2.appendChild(motivEl(S)); pat.appendChild(g2); const g3 = el("g", {transform: `translate(${-S * .75} ${S * .87})`}); g3.appendChild(motivEl(S)); pat.appendChild(g3); }
    defs.appendChild(pat); svg.appendChild(defs);
    svg.appendChild(el("path", {d: "M 300 40 C 380 20 560 30 610 80 C 640 130 600 220 560 260 C 500 300 380 290 320 250 C 270 200 260 100 300 40 Z", fill: "url(#pat13)", stroke: "#23272D", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 450, y: 290, "text-anchor": "middle", style: "font:700 12px Barlow Condensed,sans-serif;fill:#585E66"}, ["plocha s výplní vzorkem"]));
    out.innerHTML = `Dlaždice <b>${S} × ${S} px</b>, typ <b>${typ === "grid" ? "mřížka" : typ === "brick" ? "cihla po řádcích (posun 1/2)" : "šestiúhelník po řádcích"}</b>. Vzorek je výplň – zmenši objekt a vzorek zůstane stejně velký (pokud netransformuješ i vzorek). ${typ === "grid" ? "V mřížce jsou vidět pravidelné řady – pro les působí uměle." : "Posun rozbije pravidelné řady – vhodnější pro přírodní motivy."}`;
  }
  vel.addEventListener("input", draw); draw();
};

/* ---------- Maska vrstvy a prolnutí (canvas) ---------- */
W.maska = root => {
  const stage = q("[data-stage]", root), soft = q("[data-soft]", root), pos = q("[data-pos]", root), inv = q("[data-inv]", root), show = q("[data-show]", root), out = q("[data-out]", root);
  let typ = "grad"; [soft, pos].forEach(bindRange);
  seg(q("[data-typ]", root), v => { typ = v; draw(); });
  stage.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:start"><div><canvas data-a width="300" height="210" style="width:100%;border:1px solid #ccc;border-radius:4px"></canvas><small style="font:600 12px Barlow,sans-serif;color:#585E66">vrstva A (spodní)</small></div><div><canvas data-m width="300" height="210" style="width:100%;border:1px solid #ccc;border-radius:4px"></canvas><small style="font:600 12px Barlow,sans-serif;color:#585E66">maska vrstvy B</small></div><div><canvas data-r width="300" height="210" style="width:100%;border:1px solid #ccc;border-radius:4px"></canvas><small style="font:600 12px Barlow,sans-serif;color:#585E66">výsledek (B přes A)</small></div></div>`;
  const cA = q("[data-a]", stage), cM = q("[data-m]", stage), cR = q("[data-r]", stage);
  const W_ = 300, H_ = 210;
  function paintA(ctx){ // „krajina“: obloha + kopce
    const g = ctx.createLinearGradient(0, 0, 0, H_); g.addColorStop(0, "#7FB9E6"); g.addColorStop(.6, "#D9EAF6"); ctx.fillStyle = g; ctx.fillRect(0, 0, W_, H_);
    ctx.fillStyle = "#4E7A45"; ctx.beginPath(); ctx.moveTo(0, 150); ctx.quadraticCurveTo(80, 90, 160, 140); ctx.quadraticCurveTo(230, 180, 300, 130); ctx.lineTo(300, 210); ctx.lineTo(0, 210); ctx.fill();
    ctx.fillStyle = "#FBF0C4"; ctx.beginPath(); ctx.arc(230, 55, 22, 0, 7); ctx.fill();
  }
  function paintB(ctx){ // „město“: teplé pozadí + budovy
    const g = ctx.createLinearGradient(0, 0, 0, H_); g.addColorStop(0, "#B4532A"); g.addColorStop(1, "#C69A5B"); ctx.fillStyle = g; ctx.fillRect(0, 0, W_, H_);
    ctx.fillStyle = "#23272D"; [[10, 110, 40], [60, 70, 30], [100, 130, 50], [160, 50, 35], [205, 95, 45], [260, 120, 30]].forEach(([x, y, w]) => ctx.fillRect(x, y, w, 210 - y));
    ctx.fillStyle = "#FBF0C4"; for (let x = 15; x < 300; x += 22) for (let y = 80; y < 200; y += 20) if ((x * 7 + y) % 3) ctx.fillRect(x, y, 5, 7);
  }
  function maskData(){
    const c = document.createElement("canvas"); c.width = W_; c.height = H_; const ctx = c.getContext("2d");
    const S = +soft.value / 100, P = +pos.value / 100;
    if (typ === "grad"){ const g = ctx.createLinearGradient(W_ * (P - .5 * S - .02), 0, W_ * (P + .5 * S + .02), 0); g.addColorStop(0, "#fff"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.fillRect(0, 0, W_, H_); }
    else if (typ === "kruh"){ ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W_, H_); const r = 70, cx = W_ * P, cy = H_ / 2; const g = ctx.createRadialGradient(cx, cy, r * (1 - S), cx, cy, r + 2); g.addColorStop(0, "#fff"); g.addColorStop(1, "#000"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W_, H_); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(W_ * P - 60, 30); ctx.lineTo(W_ * P + 50, 20); ctx.lineTo(W_ * P + 70, 190); ctx.lineTo(W_ * P - 40, 200); ctx.closePath(); ctx.fill(); if (S > 0){ const c2 = document.createElement("canvas"); c2.width = W_; c2.height = H_; const x2 = c2.getContext("2d"); x2.filter = `blur(${S * 12}px)`; x2.drawImage(c, 0, 0); ctx.clearRect(0, 0, W_, H_); ctx.drawImage(c2, 0, 0); } }
    if (inv.checked){ const id = ctx.getImageData(0, 0, W_, H_); for (let i = 0; i < id.data.length; i += 4){ id.data[i] = 255 - id.data[i]; id.data[i + 1] = 255 - id.data[i + 1]; id.data[i + 2] = 255 - id.data[i + 2]; } ctx.putImageData(id, 0, 0); }
    return c;
  }
  function draw(){
    const a = cA.getContext("2d"), m = cM.getContext("2d"), r = cR.getContext("2d");
    paintA(a);
    const mk = maskData(); m.drawImage(mk, 0, 0);
    // výsledek: A, přes něj B s alfou z masky
    paintA(r);
    const b = document.createElement("canvas"); b.width = W_; b.height = H_; const bx = b.getContext("2d"); paintB(bx);
    const bd = bx.getImageData(0, 0, W_, H_), md = mk.getContext("2d").getImageData(0, 0, W_, H_);
    for (let i = 0; i < bd.data.length; i += 4) bd.data[i + 3] = md.data[i];
    bx.putImageData(bd, 0, 0);
    if (show.checked){ r.clearRect(0, 0, W_, H_); r.drawImage(mk, 0, 0); } else r.drawImage(b, 0, 0);
    out.innerHTML = `${typ === "grad" ? "<b>Přechod do masky</b> (nástroj G, černá→bílá): nejběžnější prolnutí dvou fotek." : typ === "kruh" ? "<b>Eliptický výběr → maska</b>, prolnutí (Shift+F6 nebo Vlastnosti › Prolnutí) změkčí okraj." : "<b>Výběr objektu / Pero → maska</b>; prolnutí masky ve Vlastnostech zjemní hranu."} Měkkost ${soft.value} %. ${inv.checked ? "Maska je invertovaná (Ctrl+I na masce) – B je vidět tam, kde předtím bylo A." : ""} ${show.checked ? "Zobrazena maska samotná (Alt+klik na miniaturu masky): bílá = B vidět, černá = B skrytá." : ""}`;
  }
  [soft, pos, inv, show].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Laboratoř štětce (canvas, kreslení myší/perem) ---------- */
W.stetec = root => {
  const stage = q("[data-stage]", root), size = q("[data-size]", root), hard = q("[data-hard]", root), op = q("[data-op]", root), flow = q("[data-flow]", root), col = q("[data-col]", root), out = q("[data-out]", root);
  [size, hard, op, flow].forEach(bindRange);
  stage.innerHTML = `<canvas data-c width="800" height="380" style="width:100%;border:1px solid #ccc;border-radius:6px;background:#fff;touch-action:none;cursor:crosshair"></canvas>`;
  const c = q("[data-c]", stage), ctx = c.getContext("2d");
  let stroke = null; // dočasné plátno pro jeden tah (krytí = strop)
  const presets = {1: [8, 100, 100, 100], 2: [60, 60, 50, 35], 3: [110, 10, 25, 20]};
  qa("[data-preset]", root).forEach(b => b.addEventListener("click", () => { const [a, h, o, f] = presets[b.dataset.preset]; size.value = a; hard.value = h; op.value = o; flow.value = f; [size, hard, op, flow].forEach(i => i.dispatchEvent(new Event("input"))); info(); }));
  q("[data-clear]", root).addEventListener("click", () => ctx.clearRect(0, 0, c.width, c.height));
  function hexToRgb(h){ return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function dab(sctx, x, y, p){
    const r = +size.value / 2 * (0.4 + 0.6 * p), H = +hard.value / 100, F = +flow.value / 100;
    const [R, G, B] = hexToRgb(col.value);
    const g = sctx.createRadialGradient(x, y, r * H, x, y, r);
    g.addColorStop(0, `rgba(${R},${G},${B},${F})`); g.addColorStop(1, `rgba(${R},${G},${B},0)`);
    sctx.fillStyle = g; sctx.beginPath(); sctx.arc(x, y, r, 0, 7); sctx.fill();
  }
  let last = null;
  function pos(e){ const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height, e.pressure && e.pointerType === "pen" ? e.pressure : 1]; }
  c.addEventListener("pointerdown", e => { c.setPointerCapture(e.pointerId); stroke = document.createElement("canvas"); stroke.width = c.width; stroke.height = c.height; last = pos(e); dab(stroke.getContext("2d"), last[0], last[1], last[2]); render(); });
  c.addEventListener("pointermove", e => {
    if (!stroke) return; const p = pos(e), sctx = stroke.getContext("2d");
    const d = Math.hypot(p[0] - last[0], p[1] - last[1]), step = Math.max(1, +size.value * .12), n = Math.ceil(d / step);
    for (let i = 1; i <= n; i++){ const t = i / n; dab(sctx, last[0] + (p[0] - last[0]) * t, last[1] + (p[1] - last[1]) * t, last[2] + (p[2] - last[2]) * t); }
    last = p; render();
  });
  const end = () => { if (!stroke) return; commit(); stroke = null; };
  c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end); c.addEventListener("pointerleave", end);
  let base = null;
  function render(){ if (!base){ base = document.createElement("canvas"); base.width = c.width; base.height = c.height; base.getContext("2d").drawImage(c, 0, 0); } ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(base, 0, 0); ctx.globalAlpha = +op.value / 100; ctx.drawImage(stroke, 0, 0); ctx.globalAlpha = 1; }
  function commit(){ render(); base = null; }
  function info(){ out.innerHTML = `Velikost <b>${size.value} px</b>, tvrdost <b>${hard.value} %</b>, krytí <b>${op.value} %</b>, tok <b>${flow.value} %</b>. ${+op.value < 100 ? "Krytí je strop: přejezdy v jednom tahu se nesčítají – zvedni pero a tah přes tah ztmavne." : ""} ${+flow.value < 100 ? "Nízký tok: barva se v jednom tahu vrství podle počtu průchodů." : ""} ${+hard.value < 30 ? "Měkký okraj – pro velké plochy a přechody." : +hard.value > 85 ? "Tvrdý okraj – pro linku." : ""} Pero s přítlakem mění velikost stopy (pointer pressure).`; }
  [size, hard, op, flow].forEach(i => i.addEventListener("input", info)); info();
  // ukázkové tahy
  (function demo(){ const ids = [[1, "#23272D", [[40, 300], [220, 60]]], [2, "#B4532A", [[300, 60], [520, 300]]], [3, "#0F5673", [[560, 80], [760, 300]]]]; ids.forEach(([pr, cl, pts]) => { const [a, h, o, f] = presets[pr]; size.value = a; hard.value = h; op.value = o; flow.value = f; col.value = cl; stroke = document.createElement("canvas"); stroke.width = c.width; stroke.height = c.height; const sctx = stroke.getContext("2d"); const n = 60; for (let i = 0; i <= n; i++){ const t = i / n; const x = pts[0][0] + (pts[1][0] - pts[0][0]) * t, y = pts[0][1] + (pts[1][1] - pts[0][1]) * t + Math.sin(t * 6) * 30; dab(sctx, x, y, .5 + .5 * Math.sin(t * Math.PI)); } commit(); stroke = null; }); size.value = 8; hard.value = 100; op.value = 100; flow.value = 100; col.value = "#B4532A"; [size, hard, op, flow].forEach(i => i.dispatchEvent(new Event("input"))); })();
};

/* ---------- Mock-up (CSS 3D) ---------- */
W.mockup = root => {
  const stage = q("[data-stage]", root), ry = q("[data-roty]", root), rx = q("[data-rotx]", root), sh = q("[data-shade]", root), bl = q("[data-blur]", root), od = q("[data-odlesk]", root), out = q("[data-out]", root);
  let obsah = "a"; [ry, rx, sh, bl].forEach(bindRange);
  seg(q("[data-obsah]", root), v => { obsah = v; draw(); });
  const designy = {
    a: `<div style="width:100%;height:100%;background:#F4F0E7;display:flex;flex-direction:column;justify-content:space-between;padding:14px;box-sizing:border-box"><div style="font:800 34px/1 Barlow Condensed,sans-serif;color:#23272D">VÝSTAVA<br>GRAFIKY</div><div style="height:40%;background:#B4532A;border-radius:4px"></div><div style="font:600 12px Barlow,sans-serif;color:#585E66">SPŠE Pardubice · 2027</div></div>`,
    b: `<div style="width:100%;height:100%;background:#0F5673;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff"><div style="width:60px;height:60px;border-radius:50%;background:#38C4F0;margin-bottom:12px"></div><div style="font:800 30px/1 Barlow Condensed,sans-serif;letter-spacing:2px">PIXA</div><div style="font:500 12px Barlow,sans-serif;opacity:.8">weby na míru</div></div>`,
    c: `<div style="width:100%;height:100%;background:linear-gradient(135deg,#C8257A,#D9A400)"></div>`
  };
  function draw(){
    const Y = +ry.value, X = +rx.value, S = +sh.value, B = +bl.value;
    const shadowX = Math.round(-Y * .6), shadowY = 18 + Math.abs(X);
    stage.innerHTML = `<div style="position:relative;height:330px;background:linear-gradient(180deg,#e9e4d9,#cfc8bb);border-radius:8px;overflow:hidden;perspective:900px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;inset:auto 0 0 0;height:45%;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.12))"></div>
      <div style="position:relative;width:200px;height:260px;transform:rotateY(${Y}deg) rotateX(${X}deg);transform-style:preserve-3d;box-shadow:${shadowX}px ${shadowY}px ${B}px rgba(20,15,10,.45)">
        <div style="position:absolute;inset:0;overflow:hidden;background:#fff">${designy[obsah]}
          <div style="position:absolute;inset:0;background:linear-gradient(${Y >= 0 ? "90deg" : "270deg"},rgba(0,0,0,.55),rgba(0,0,0,0) ${S}%);mix-blend-mode:multiply;pointer-events:none"></div>
          ${od.checked ? `<div style="position:absolute;inset:0;background:linear-gradient(${Y >= 0 ? "270deg" : "90deg"},rgba(255,255,255,.35),rgba(255,255,255,0) 40%);mix-blend-mode:screen"></div><div style="position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 1px,transparent 1px 3px);mix-blend-mode:multiply"></div>` : ""}
        </div>
      </div>
      <div style="position:absolute;left:12px;top:10px;font:600 12px Barlow,sans-serif;color:#585E66">plocha v prostoru · inteligentní objekt · polostín · odlesk</div>
    </div>`;
    out.innerHTML = `Obsah: <b>${obsah === "a" ? "Plakát A" : obsah === "b" ? "Plakát B" : "vlastní barva"}</b> – výměna obsahu = dvojklik na inteligentní objekt; perspektiva, maska a stín zůstávají. Polostín zasahuje do <b>${S} %</b> plochy${S > 70 ? " – příliš, plocha je celá ve stínu" : S < 30 ? " – málo, chybí dojem prostoru" : " – odpovídá zadání (cca polovina)"}. Stín s rozostřením ${B} px${B < 10 ? " je tvrdý, působí uměle" : ""}. ${Math.abs(Y) > 38 ? "Přehnaná perspektiva – design se deformuje." : ""}`;
  }
  [ry, rx, sh, bl, od].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Snímková animace banneru 250 × 250 ---------- */
W.animace = root => {
  const stage = q("[data-stage]", root), tw = q("[data-tween]", root), dl = q("[data-delay]", root), hd = q("[data-hold]", root), pl = q("[data-puls]", root), out = q("[data-out]", root);
  [tw, dl, hd].forEach(bindRange);
  let timer = null, idx = 0, frames = [];
  const lerp = (a, b, t) => a + (b - a) * t;
  // klíčové stavy: produkt (x, krytí), titulek (krytí), cena+CTA (krytí), lesk (poloha), puls (měřítko)
  const K = [
    {prod: [-140, 0], tit: 0, cta: 0, lesk: -1, pulz: 1},
    {prod: [0, 1], tit: 0, cta: 0, lesk: -1, pulz: 1},
    {prod: [0, 1], tit: 1, cta: 0, lesk: -1, pulz: 1},
    {prod: [0, 1], tit: 1, cta: 1, lesk: -1, pulz: 1},
    {prod: [0, 1], tit: 1, cta: 1, lesk: 1.2, pulz: 1.06}
  ];
  function sestav(){
    const n = +tw.value, d = +dl.value, hold = +hd.value;
    frames = [];
    for (let i = 0; i < K.length - 1; i++){
      const a = K[i], b = K[i + 1];
      const kroky = n + 1;
      for (let s = 0; s < kroky; s++){
        const t = s / kroky;
        frames.push({prod: [lerp(a.prod[0], b.prod[0], t), lerp(a.prod[1], b.prod[1], t)], tit: lerp(a.tit, b.tit, t), cta: lerp(a.cta, b.cta, t), lesk: lerp(a.lesk, b.lesk, t), pulz: pl.checked ? lerp(a.pulz, b.pulz, t) : 1, delay: d});
      }
    }
    const last = Object.assign({}, K[K.length - 1], {delay: hold, pulz: 1});
    frames.push(last);
    if (pl.checked){ // pulz tlačítka na konci: 2 snímky
      frames.push(Object.assign({}, last, {delay: 0.25, pulz: 1.08}));
      frames.push(Object.assign({}, last, {delay: 0.25, pulz: 1}));
    }
  }
  function kresli(f, i){
    const S = stage.clientWidth ? Math.min(1.4, (stage.clientWidth - 40) / 250) : 1;
    stage.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
      <div style="width:${250 * S}px;height:${250 * S}px;position:relative;overflow:hidden;border-radius:${14 * S}px;background:linear-gradient(160deg,#0F5673,#082F40);box-shadow:0 ${8 * S}px ${24 * S}px rgba(0,0,0,.35);font-family:Barlow,sans-serif;color:#fff;transform:scale(${f.pulz});transition:none">
        <div style="position:absolute;left:${(22 + f.prod[0]) * S}px;top:${22 * S}px;width:${96 * S}px;height:${140 * S}px;opacity:${f.prod[1]};border-radius:${10 * S}px;background:linear-gradient(135deg,#38C4F0,#1A8FB8);box-shadow:0 ${6 * S}px ${14 * S}px rgba(0,0,0,.4)"><div style="position:absolute;inset:${14 * S}px ${14 * S}px auto;height:${70 * S}px;border-radius:${6 * S}px;background:#F4F0E7"></div><div style="position:absolute;left:${14 * S}px;right:${14 * S}px;bottom:${16 * S}px;height:${10 * S}px;background:#082F40;border-radius:${3 * S}px"></div></div>
        <div style="position:absolute;left:${130 * S}px;top:${26 * S}px;white-space:nowrap;opacity:${f.tit};font:800 ${21 * S}px/1.05 'Barlow Condensed',sans-serif;letter-spacing:.5px">NOVÁ<br>KOLEKCE</div>
        <div style="position:absolute;left:${130 * S}px;top:${84 * S}px;white-space:nowrap;opacity:${f.cta};font:700 ${26 * S}px/1 'Barlow Condensed',sans-serif;color:#D9A400">1 290 Kč</div>
        <div style="position:absolute;left:${28 * S}px;right:${28 * S}px;bottom:${22 * S}px;height:${44 * S}px;opacity:${f.cta};border-radius:${22 * S}px;background:#B4532A;display:flex;align-items:center;justify-content:center;font:700 ${16 * S}px Barlow,sans-serif;letter-spacing:1px;overflow:hidden;box-shadow:0 ${4 * S}px ${10 * S}px rgba(0,0,0,.35)">KOUPIT →<div style="position:absolute;top:0;bottom:0;width:${40 * S}px;left:${f.lesk * 100}%;transform:skewX(-20deg);background:rgba(255,255,255,.35)"></div></div>
      </div>
      <div style="font:600 12px Barlow,sans-serif;color:#585E66">snímek ${i + 1} / ${frames.length} · zpoždění ${fmt(f.delay, 2)} s</div>
    </div>`;
  }
  function vypis(){
    const n = frames.length, cas = frames.reduce((a, f) => a + f.delay, 0);
    const kb = Math.round(14 + n * 3.2 + (+tw.value) * 1.5);
    const fps = +tw.value ? 1 / +dl.value : null;
    out.innerHTML = `Snímků celkem: <b>${n}</b> (5 klíčových + ${+tw.value} mezisnímků × 4 přechody${pl.checked ? " + pulz" : ""}), délka smyčky <b>${fmt(cas, 1)} s</b>, odhad GIF 256 barev ≈ <b>${kb} kB</b>${kb > 150 ? " – nad cílem 150 kB, uber mezisnímků nebo barev" : ""}. ${+tw.value === 0 ? "Bez mezisnímků animace „skáče“ – komise uvidí jen střihy." : fps < 8 ? "Zpoždění je velké, pohyb je trhaný (pod 8 snímků/s)." : fps > 20 ? "Hodně snímků za sekundu – plynulé, ale velký soubor." : "Plynulost odpovídá dobrému banneru (8–20 snímků/s)."} Poslední snímek drží <b>${fmt(+hd.value, 1)} s</b> – kompletní sdělení zůstane čitelné.`;
  }
  function stop(){ if (timer) clearTimeout(timer); timer = null; root.classList.remove("hraje"); }
  function krok(){
    kresli(frames[idx], idx);
    timer = setTimeout(() => { idx = (idx + 1) % frames.length; krok(); }, frames[idx].delay * 1000);
  }
  function play(){ stop(); sestav(); vypis(); idx = 0; root.classList.add("hraje"); krok(); }
  q("[data-play]", root).addEventListener("click", play);
  q("[data-stop]", root).addEventListener("click", stop);
  [tw, dl, hd, pl].forEach(i => i.addEventListener("input", () => { const h = !!timer; stop(); sestav(); vypis(); idx = 0; kresli(frames[frames.length - 1 - (pl.checked ? 2 : 0)], frames.length - 1 - (pl.checked ? 2 : 0)); if (h) play(); }));
  sestav(); vypis(); kresli(frames[frames.length - 1 - (pl.checked ? 2 : 0)], frames.length - 1 - (pl.checked ? 2 : 0));
};

/* ---------- Síť krabičky a složený obal ---------- */
W.krabice = root => {
  const svg = q("svg", root), iw = q("[data-w]", root), ih = q("[data-h]", root), id = q("[data-d]", root), sp = q("[data-spad]", root), out = q("[data-out]", root);
  let rezim = "sit"; [iw, ih, id].forEach(bindRange);
  seg(q("[data-rezim]", root), v => { rezim = v; draw(); });
  function draw(){
    const Wm = +iw.value, Hm = +ih.value, Dm = +id.value, F = 14; // chlopeň 14 mm
    svg.innerHTML = "";
    const sirka = Wm * 2 + Dm * 2 + F, vyska = Hm + Dm * 2 + F * 1.2;
    const S = Math.min(470 / sirka, 290 / vyska), x0 = 20, y0 = 45 + (290 - vyska * S) / 2 + (Dm + F * .6) * S;
    const X = v => x0 + v * S, Y = v => y0 + v * S;
    const g = el("g");
    const spad = sp.checked ? 3 * S : 0;
    const kraft = rezim === "sit" ? "#D9C3A0" : "#fff";
    const grafika = rezim === "sit";
    // panely: bok(D) | přední(W) | bok(D) | zadní(W) | chlopeň
    const px = [0, Dm, Dm + Wm, Dm * 2 + Wm, Dm * 2 + Wm * 2];
    const pw = [Dm, Wm, Dm, Wm];
    const panelY = 0, panelH = Hm;
    // spadávka (podtisk)
    if (grafika && spad){
      g.appendChild(el("rect", {x: X(0) - spad, y: Y(panelY) - spad, width: (Dm * 2 + Wm * 2) * S + spad * 2, height: Hm * S + spad * 2, fill: "#B4532A", opacity: .35}));
    }
    // těla panelů
    pw.forEach((w, i) => {
      g.appendChild(el("rect", {x: X(px[i]), y: Y(panelY), width: w * S, height: panelH * S, fill: kraft, stroke: "none"}));
    });
    // víko a dno nad/pod předním panelem (i=1): klopa D + jazýček
    const fx = X(px[1]), fw = Wm * S;
    g.appendChild(el("rect", {x: fx, y: Y(panelY - Dm), width: fw, height: Dm * S, fill: kraft}));
    g.appendChild(el("path", {d: `M${fx + 4} ${Y(panelY - Dm)} L${fx + 10} ${Y(panelY - Dm - F * .6)} L${fx + fw - 10} ${Y(panelY - Dm - F * .6)} L${fx + fw - 4} ${Y(panelY - Dm)} Z`, fill: kraft}));
    g.appendChild(el("rect", {x: fx, y: Y(panelY + Hm), width: fw, height: Dm * S, fill: kraft}));
    g.appendChild(el("path", {d: `M${fx + 4} ${Y(panelY + Hm + Dm)} L${fx + 10} ${Y(panelY + Hm + Dm + F * .6)} L${fx + fw - 10} ${Y(panelY + Hm + Dm + F * .6)} L${fx + fw - 4} ${Y(panelY + Hm + Dm)} Z`, fill: kraft}));
    // prachové chlopně na bocích (i=0,2)
    [0, 2].forEach(i => {
      const bx = X(px[i]), bw = Dm * S;
      g.appendChild(el("path", {d: `M${bx + 2} ${Y(panelY)} L${bx + 2} ${Y(panelY - Dm * .55)} L${bx + bw - 2} ${Y(panelY - Dm * .55)} L${bx + bw - 2} ${Y(panelY)} Z`, fill: kraft}));
      g.appendChild(el("path", {d: `M${bx + 2} ${Y(panelY + Hm)} L${bx + 2} ${Y(panelY + Hm + Dm * .55)} L${bx + bw - 2} ${Y(panelY + Hm + Dm * .55)} L${bx + bw - 2} ${Y(panelY + Hm)} Z`, fill: kraft}));
    });
    // lepicí chlopeň vpravo
    const lx = X(px[4]);
    g.appendChild(el("path", {d: `M${lx} ${Y(panelY)} L${lx + F * S} ${Y(panelY + F * .3)} L${lx + F * S} ${Y(panelY + Hm - F * .3)} L${lx} ${Y(panelY + Hm)} Z`, fill: grafika ? "#CBB48F" : "#fff"}));
    // grafika na předním panelu
    if (grafika){
      const cx = fx + fw / 2;
      g.appendChild(el("rect", {x: fx, y: Y(panelY), width: fw, height: Hm * S * .42, fill: "#B4532A"}));
      g.appendChild(el("circle", {cx, cy: Y(panelY) + Hm * S * .21, r: Math.min(fw, Hm * S * .42) * .3, fill: "#F4F0E7"}));
      g.appendChild(txt(cx, Y(panelY) + Hm * S * .62, "BYLINKA", "g-txt", {"text-anchor": "middle", "font-weight": "800", "font-size": Math.max(9, fw / 7)}));
      g.appendChild(txt(cx, Y(panelY) + Hm * S * .74, "sypaný čaj · 50 g", "g-txt2", {"text-anchor": "middle", "font-size": Math.max(7, fw / 12)}));
      // zadní panel: text + EAN + recyklace
      const zx = X(px[3]), zw = Wm * S;
      for (let i = 0; i < 6; i++) g.appendChild(el("rect", {x: zx + zw * .12, y: Y(panelY) + Hm * S * (.12 + i * .07), width: zw * (.76 - (i % 3) * .1), height: 2, fill: "#585E66"}));
      for (let i = 0; i < 14; i++) g.appendChild(el("rect", {x: zx + zw * .2 + i * zw * .042, y: Y(panelY) + Hm * S * .66, width: (i % 3 === 0 ? 2.2 : 1.2), height: Hm * S * .14, fill: "#23272D"}));
      g.appendChild(el("circle", {cx: zx + zw * .78, cy: Y(panelY) + Hm * S * .9, r: Math.max(4, zw * .06), fill: "none", stroke: "#23272D", "stroke-width": 1.5}));
      g.appendChild(txt(zx + zw * .2, Y(panelY) + Hm * S * .92, "PAP 21", "g-txt2", {"font-size": Math.max(6, zw / 14)}));
      // boky: slogan svisle
      [0, 2].forEach(i => { const bx = X(px[i]) + Dm * S / 2; g.appendChild(txt(bx, Y(panelY) + Hm * S / 2, i === 0 ? "100 % kompostovatelný obal" : "bio · lokální · bez odpadu", "g-txt2", {"text-anchor": "middle", "font-size": Math.max(6, Math.min(Dm * S / 3.2, 10)), transform: `rotate(-90 ${bx} ${Y(panelY) + Hm * S / 2})`})); });
    }
    // čáry: výsek (plná) a rylování (čárkovaná)
    const cut = {fill: "none", stroke: "#C8257A", "stroke-width": 1.4}, rill = {fill: "none", stroke: "#0F5673", "stroke-width": 1.2, "stroke-dasharray": "5 3"};
    const outline = [
      `M${X(0) + 2} ${Y(panelY)} L${X(0) + 2} ${Y(panelY - Dm * .55)} L${X(Dm) - 2} ${Y(panelY - Dm * .55)} L${X(Dm) - 2} ${Y(panelY)}`,
      `M${fx} ${Y(panelY)} L${fx} ${Y(panelY - Dm)} L${fx + 4} ${Y(panelY - Dm)} L${fx + 10} ${Y(panelY - Dm - F * .6)} L${fx + fw - 10} ${Y(panelY - Dm - F * .6)} L${fx + fw - 4} ${Y(panelY - Dm)} L${fx + fw} ${Y(panelY - Dm)} L${fx + fw} ${Y(panelY)}`,
      `M${X(px[2]) + 2} ${Y(panelY)} L${X(px[2]) + 2} ${Y(panelY - Dm * .55)} L${X(px[3]) - 2} ${Y(panelY - Dm * .55)} L${X(px[3]) - 2} ${Y(panelY)}`,
      `M${X(px[3])} ${Y(panelY)} L${X(px[4])} ${Y(panelY)} L${lx + F * S} ${Y(panelY + F * .3)} L${lx + F * S} ${Y(panelY + Hm - F * .3)} L${X(px[4])} ${Y(panelY + Hm)} L${X(px[3])} ${Y(panelY + Hm)}`,
      `M${X(px[2]) + 2} ${Y(panelY + Hm)} L${X(px[2]) + 2} ${Y(panelY + Hm + Dm * .55)} L${X(px[3]) - 2} ${Y(panelY + Hm + Dm * .55)} L${X(px[3]) - 2} ${Y(panelY + Hm)}`,
      `M${fx} ${Y(panelY + Hm)} L${fx} ${Y(panelY + Hm + Dm)} L${fx + 4} ${Y(panelY + Hm + Dm)} L${fx + 10} ${Y(panelY + Hm + Dm + F * .6)} L${fx + fw - 10} ${Y(panelY + Hm + Dm + F * .6)} L${fx + fw - 4} ${Y(panelY + Hm + Dm)} L${fx + fw} ${Y(panelY + Hm + Dm)} L${fx + fw} ${Y(panelY + Hm)}`,
      `M${X(0) + 2} ${Y(panelY + Hm)} L${X(0) + 2} ${Y(panelY + Hm + Dm * .55)} L${X(Dm) - 2} ${Y(panelY + Hm + Dm * .55)} L${X(Dm) - 2} ${Y(panelY + Hm)}`,
      `M${X(0)} ${Y(panelY)} L${X(0)} ${Y(panelY + Hm)}`,
      `M${X(0)} ${Y(panelY)} L${X(0) + 2} ${Y(panelY)} M${X(Dm) - 2} ${Y(panelY)} L${X(Dm)} ${Y(panelY)} M${X(0)} ${Y(panelY + Hm)} L${X(0) + 2} ${Y(panelY + Hm)} M${X(Dm) - 2} ${Y(panelY + Hm)} L${X(Dm)} ${Y(panelY + Hm)}`,
      `M${X(px[2])} ${Y(panelY)} L${X(px[2]) + 2} ${Y(panelY)} M${X(px[3]) - 2} ${Y(panelY)} L${X(px[3])} ${Y(panelY)} M${X(px[2])} ${Y(panelY + Hm)} L${X(px[2]) + 2} ${Y(panelY + Hm)} M${X(px[3]) - 2} ${Y(panelY + Hm)} L${X(px[3])} ${Y(panelY + Hm)}`
    ];
    outline.forEach(d => g.appendChild(el("path", Object.assign({d}, cut))));
    // rylování: svislé mezi panely + vodorovné u klop
    [1, 2, 3, 4].forEach(i => g.appendChild(el("path", Object.assign({d: `M${X(px[i])} ${Y(panelY)} L${X(px[i])} ${Y(panelY + Hm)}`}, rill))));
    g.appendChild(el("path", Object.assign({d: `M${X(0)} ${Y(panelY)} L${X(px[4])} ${Y(panelY)} M${X(0)} ${Y(panelY + Hm)} L${X(px[4])} ${Y(panelY + Hm)} M${fx} ${Y(panelY - Dm)} L${fx + fw} ${Y(panelY - Dm)} M${fx} ${Y(panelY + Hm + Dm)} L${fx + fw} ${Y(panelY + Hm + Dm)}`}, rill)));
    // popisky
    g.appendChild(txt(X(Dm + Wm / 2), Y(panelY + Hm) + Dm * S + F * .6 * S + 16, "přední stěna", "g-txt2", {"text-anchor": "middle"}));
    g.appendChild(txt(X(Dm * 2 + Wm * 1.5), Y(panelY + Hm) + Dm * S * .55 + 16, "zadní stěna", "g-txt2", {"text-anchor": "middle"}));
    g.appendChild(txt(X(Dm / 2), Y(panelY + Hm) + Dm * S * .55 + 16, "bok", "g-txt2", {"text-anchor": "middle"}));
    g.appendChild(txt(lx + F * S + 4, Y(panelY + Hm / 2), "lepicí chlopeň", "g-txt2", {"font-size": 9, transform: `rotate(90 ${lx + F * S + 4} ${Y(panelY + Hm / 2)})`}));
    svg.appendChild(g);
    // legenda
    const lg = el("g", {transform: "translate(20 14)"});
    lg.appendChild(el("path", Object.assign({d: "M0 0 L26 0"}, cut))); lg.appendChild(txt(32, 4, "výsek (řez)", "g-txt2", {"font-size": 10}));
    lg.appendChild(el("path", Object.assign({d: "M110 0 L136 0"}, rill))); lg.appendChild(txt(142, 4, "rylování (ohyb)", "g-txt2", {"font-size": 10}));
    if (grafika && spad){ lg.appendChild(el("rect", {x: 240, y: -5, width: 26, height: 10, fill: "#B4532A", opacity: .35})); lg.appendChild(txt(272, 4, "spadávka 3 mm", "g-txt2", {"font-size": 10})); }
    svg.appendChild(lg);
    // složená krabička (kabinetní projekce) vpravo
    const ox = 560, oy = 300, k = Math.min(150 / (Wm + Dm * .5), 230 / (Hm + Dm * .5));
    const w = Wm * k, h = Hm * k, d = Dm * k * .5;
    const box = el("g");
    box.appendChild(el("ellipse", {cx: ox + w / 2 + d / 2, cy: oy + 6, rx: w * .7, ry: 10, fill: "rgba(0,0,0,.18)"}));
    box.appendChild(el("path", {d: `M${ox} ${oy - h} L${ox + d} ${oy - h - d} L${ox + w + d} ${oy - h - d} L${ox + w} ${oy - h} Z`, fill: grafika ? "#E6D2B0" : "#fff", stroke: "#23272D", "stroke-width": 1}));
    box.appendChild(el("path", {d: `M${ox + w} ${oy - h} L${ox + w + d} ${oy - h - d} L${ox + w + d} ${oy - d} L${ox + w} ${oy} Z`, fill: grafika ? "#B89C73" : "#eee", stroke: "#23272D", "stroke-width": 1}));
    box.appendChild(el("rect", {x: ox, y: oy - h, width: w, height: h, fill: grafika ? "#D9C3A0" : "#fff", stroke: "#23272D", "stroke-width": 1}));
    if (grafika){
      box.appendChild(el("rect", {x: ox, y: oy - h, width: w, height: h * .42, fill: "#B4532A"}));
      box.appendChild(el("circle", {cx: ox + w / 2, cy: oy - h + h * .21, r: Math.min(w, h * .42) * .3, fill: "#F4F0E7"}));
      box.appendChild(txt(ox + w / 2, oy - h + h * .62, "BYLINKA", "g-txt", {"text-anchor": "middle", "font-weight": "800", "font-size": Math.max(9, w / 7)}));
      box.appendChild(txt(ox + w / 2, oy - h + h * .74, "sypaný čaj · 50 g", "g-txt2", {"text-anchor": "middle", "font-size": Math.max(7, w / 12)}));
    }
    box.appendChild(txt(ox + w / 2 + d / 2, oy + 32, "složený obal (kabinetní projekce)", "g-txt2", {"text-anchor": "middle", "font-size": 10}));
    svg.appendChild(box);
    const plocha = (sirka * vyska) / 100, arch = 450 * 320 / 100; // SRA3
    out.innerHTML = `Síť má <b>${fmt(sirka, 0)} × ${fmt(vyska, 0)} mm</b> (≈ ${fmt(plocha, 0)} cm²); na arch SRA3 320 × 450 mm se vejde <b>${Math.max(Math.floor(450 / sirka) * Math.floor(320 / vyska), Math.floor(320 / sirka) * Math.floor(450 / vyska))}×</b>. Lepicí chlopeň 14 mm, prachové klopy na bocích, víko se zasouvacím jazýčkem. Objem ${fmt(Wm * Hm * Dm / 1e6, 2)} l. ${Dm > Wm ? "Hloubka větší než šířka – obal se na polici převrátí, zvaž otočení." : ""} ${rezim === "sit" ? "Potisk jde přes rylování na boky a 3 mm za řez." : "Takto vypadá výsekový výkres pro výrobce – bez grafiky, jen čáry."}`;
  }
  [iw, ih, id, sp].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Responzivní e-shop ---------- */
W.eshop = root => {
  const stage = q("[data-stage]", root), cols = q("[data-cols]", root), hero = q("[data-hero]", root), gr = q("[data-grid]", root), an = q("[data-anot]", root), out = q("[data-out]", root);
  let dev = "desktop"; [cols, hero].forEach(bindRange);
  seg(q("[data-dev]", root), v => { dev = v; draw(); });
  function karta(w, h, i, f){
    return `<div style="position:relative;width:${w}px;height:${h}px;background:#fff;border:1px solid #e3dccd;border-radius:${4 * f}px;overflow:hidden"><div style="height:58%;background:${["#D9C3A0", "#B4532A", "#0F5673", "#D9A400", "#5B8A4A", "#C8257A"][i % 6]};opacity:.75"></div><div style="padding:${6 * f}px"><div style="height:${7 * f}px;width:70%;background:#23272D;margin-bottom:${4 * f}px"></div><div style="height:${7 * f}px;width:35%;background:#B4532A;margin-bottom:${5 * f}px"></div><div style="height:${12 * f}px;width:60%;background:#0F5673;border-radius:${6 * f}px"></div></div></div>`;
  }
  function draw(){
    const C = +cols.value, H = +hero.value / 100, G = gr.checked, A = an.checked;
    const lbl = (t, extra = "") => A ? `<div style="position:absolute;${extra};font:600 9px Barlow,sans-serif;color:#fff;background:#C8257A;padding:1px 5px;border-radius:3px;z-index:3">${t}</div>` : "";
    const avail = Math.max(300, stage.clientWidth - 40);
    if (dev === "desktop"){
      const Wd = Math.min(avail, 720), f = Wd / 1920, Hd = 1080 * f; // 1 px návrhu = f px
      const obsah = Math.min(1440, 1920) * f, okraj = (1920 - 1440) / 2 * f, zlab = 32 * f, sl = (obsah - zlab * 11) / 12;
      const hh = 80 * f, heroH = Hd * H;
      const kw = (obsah - zlab * (C - 1)) / C, kh = kw * 1.25;
      const mrizka = G ? `<div style="position:absolute;left:${okraj}px;top:0;bottom:0;width:${obsah}px;display:flex;gap:${zlab}px;pointer-events:none;z-index:2">${Array.from({length: 12}, () => `<div style="flex:1;background:rgba(200,37,122,.08);border-left:1px dashed rgba(200,37,122,.5);border-right:1px dashed rgba(200,37,122,.5)"></div>`).join("")}</div><div style="position:absolute;left:0;right:0;top:${Hd}px;border-top:2px dashed #C8257A;z-index:2"></div>` : "";
      stage.innerHTML = `<div style="margin:0 auto;width:${Wd}px"><div style="position:relative;width:${Wd}px;height:${Hd + 420 * f}px;background:#F8F5EE;border:1px solid #cfc8bb;overflow:hidden;font-family:Barlow,sans-serif">
        ${mrizka}
        <div style="position:absolute;left:0;right:0;top:0;height:${hh}px;background:#fff;border-bottom:1px solid #e3dccd;display:flex;align-items:center;padding:0 ${okraj}px;gap:${24 * f}px"><div style="font:800 ${26 * f}px 'Barlow Condensed',sans-serif">BYLINKA</div>${["Čaje", "Káva", "Dárky", "O nás"].map(t => `<div style="font:500 ${16 * f}px Barlow,sans-serif;color:#585E66">${t}</div>`).join("")}<div style="flex:1"></div><div style="width:${220 * f}px;height:${36 * f}px;border:1px solid #cfc8bb;border-radius:${18 * f}px"></div><div style="width:${36 * f}px;height:${36 * f}px;border-radius:50%;background:#B4532A"></div></div>
        ${lbl("hlavička: logo · menu · hledání · košík", `left:50%;transform:translateX(-50%);top:4px`)}
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${hh + 24 * f}px;height:${heroH - hh - 40 * f}px;background:#0F5673;border-radius:${8 * f}px;display:flex;align-items:center;padding:0 ${48 * f}px;gap:${40 * f}px;color:#fff"><div style="flex:1"><div style="font:800 ${56 * f}px/1 'Barlow Condensed',sans-serif">Sypaný čaj<br>v kompostovatelném obalu</div><div style="margin-top:${16 * f}px;width:60%;height:${12 * f}px;background:rgba(255,255,255,.5)"></div><div style="margin-top:${24 * f}px;width:${200 * f}px;height:${52 * f}px;background:#B4532A;border-radius:${26 * f}px;display:flex;align-items:center;justify-content:center;font:700 ${18 * f}px Barlow,sans-serif">KOUPIT · 129 Kč</div></div><div style="width:${Math.min(320 * f, (heroH - hh - 80 * f) * .8)}px;height:${Math.min(400 * f, heroH - hh - 80 * f)}px;background:#D9C3A0;border-radius:${6 * f}px;box-shadow:${-10 * f}px ${14 * f}px ${24 * f}px rgba(0,0,0,.35)"></div></div>
        ${lbl("hero: 3D vizualizace + CTA „Koupit“", `left:${okraj + 8 * f}px;top:${hh + 30 * f}px`)}
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${heroH}px;display:flex;gap:${zlab}px">${["eko obal", "doprava zdarma", "lokální pěstitel"].map(t => `<div style="flex:1;height:${56 * f}px;background:#fff;border:1px solid #e3dccd;border-radius:${6 * f}px;display:flex;align-items:center;gap:${10 * f}px;padding:0 ${14 * f}px;font:600 ${14 * f}px Barlow,sans-serif;color:#23272D"><div style="width:${28 * f}px;height:${28 * f}px;border-radius:50%;background:#5B8A4A"></div>${t}</div>`).join("")}</div>
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${heroH + 80 * f}px;display:flex;gap:${zlab}px;flex-wrap:wrap">${Array.from({length: C * 2}, (_, i) => karta(kw, kh, i, f)).join("")}</div>
        ${lbl(`produkty: ${C} v řadě, karta ${Math.round(kw / f)} px`, `left:${okraj + 8 * f}px;top:${heroH + 88 * f}px`)}
        ${G ? lbl("fold 1080 px – konec první obrazovky", `right:8px;top:${Hd - 18}px`) : ""}
      </div><div style="font:600 11px Barlow,sans-serif;color:#585E66;margin-top:6px;text-align:center">1920 × 1080 px (zobrazeno + přetečení pod fold) · obsah 1440 px · 12 sloupců, žlab 32 px</div></div>`;
      out.innerHTML = `Desktop: obsah na střed do <b>1440 px</b>, sloupec <b>${Math.round(sl / f)} px</b>. Hero zabírá <b>${Math.round(H * 100)} %</b> výšky${H > 0.6 ? " – produkty jsou až pod foldem, zmenši hero" : H < 0.35 ? " – hero je nízké, CTA zaniká" : " – CTA i začátek produktů jsou vidět bez scrollu"}. ${C >= 5 ? "Karty jsou úzké (" + Math.round(kw / f) + " px) – fotky budou malé." : C === 2 ? "Dvě karty v řadě na desktopu plýtvají místem." : "4 karty = typický e-shop."}`;
    } else {
      const Wm = Math.min(avail, 300), f = Wm / 1080, Hm = 1920 * f, okraj = 48 * f, obsah = Wm - okraj * 2, zlab = 24 * f;
      const hh = 120 * f, heroH = Hm * H;
      const kw = (obsah - zlab) / 2, kh = kw * 1.3;
      const mrizka = G ? `<div style="position:absolute;left:${okraj}px;top:0;bottom:0;width:${obsah}px;display:flex;gap:${zlab}px;pointer-events:none;z-index:2">${Array.from({length: 4}, () => `<div style="flex:1;background:rgba(200,37,122,.08);border-left:1px dashed rgba(200,37,122,.5);border-right:1px dashed rgba(200,37,122,.5)"></div>`).join("")}</div>` : "";
      stage.innerHTML = `<div style="margin:0 auto;width:${Wm}px"><div style="position:relative;width:${Wm}px;height:${Hm}px;background:#F8F5EE;border:1px solid #cfc8bb;border-radius:${40 * f}px;overflow:hidden;font-family:Barlow,sans-serif">
        ${mrizka}
        <div style="position:absolute;left:0;right:0;top:0;height:${hh}px;background:#fff;border-bottom:1px solid #e3dccd;display:flex;align-items:center;padding:0 ${okraj}px;gap:${16 * f}px"><div style="width:${40 * f}px;height:${30 * f}px;display:flex;flex-direction:column;justify-content:space-between"><div style="height:${4 * f}px;background:#23272D"></div><div style="height:${4 * f}px;background:#23272D"></div><div style="height:${4 * f}px;background:#23272D"></div></div><div style="font:800 ${44 * f}px 'Barlow Condensed',sans-serif">BYLINKA</div><div style="flex:1"></div><div style="width:${56 * f}px;height:${56 * f}px;border-radius:50%;background:#B4532A"></div></div>
        ${lbl("hamburger · logo · košík", `left:50%;transform:translateX(-50%);top:4px`)}
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${hh + 32 * f}px;height:${heroH - hh - 56 * f}px;background:#0F5673;border-radius:${16 * f}px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${32 * f}px;gap:${20 * f}px;color:#fff;text-align:center"><div style="width:${Math.min(420 * f, (heroH - hh - 300 * f) * .7)}px;height:${Math.min(520 * f, heroH - hh - 300 * f)}px;background:#D9C3A0;border-radius:${8 * f}px;box-shadow:${-10 * f}px ${16 * f}px ${28 * f}px rgba(0,0,0,.35)"></div><div style="font:800 ${64 * f}px/1 'Barlow Condensed',sans-serif">Sypaný čaj<br>v kompostovatelném obalu</div><div style="width:100%;height:${88 * f}px;background:#B4532A;border-radius:${44 * f}px;display:flex;align-items:center;justify-content:center;font:700 ${30 * f}px Barlow,sans-serif">KOUPIT · 129 Kč</div></div>
        ${lbl("hero na výšku, CTA přes šířku", `left:${okraj + 8 * f}px;top:${hh + 40 * f}px`)}
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${heroH}px;display:flex;flex-direction:column;gap:${12 * f}px">${["eko obal", "doprava zdarma", "lokální pěstitel"].map(t => `<div style="height:${72 * f}px;background:#fff;border:1px solid #e3dccd;border-radius:${10 * f}px;display:flex;align-items:center;gap:${16 * f}px;padding:0 ${20 * f}px;font:600 ${26 * f}px Barlow,sans-serif;color:#23272D"><div style="width:${40 * f}px;height:${40 * f}px;border-radius:50%;background:#5B8A4A"></div>${t}</div>`).join("")}</div>
        <div style="position:absolute;left:${okraj}px;width:${obsah}px;top:${heroH + 280 * f}px;display:flex;gap:${zlab}px;flex-wrap:wrap">${Array.from({length: 4}, (_, i) => karta(kw, kh, i, f * 1.8)).join("")}</div>
        ${lbl("produkty 2 v řadě", `left:${okraj + 8 * f}px;top:${heroH + 288 * f}px`)}
      </div><div style="font:600 11px Barlow,sans-serif;color:#585E66;margin-top:6px;text-align:center">1080 × 1920 px · okraj 48 px · 4 sloupce · písmo 2× (hustota 2–3×)</div></div>`;
      out.innerHTML = `Mobil: stejný obsah, bloky <b>pod sebou</b>: hamburger místo menu, hero na výšku s CTA přes celou šířku, výhody v jednom sloupci, produkty <b>2 v řadě</b> (karta ${Math.round(kw / f)} px). Písmo v 1080 px šířce musí být cca 2× větší než na desktopu (základ 32 px), jinak je na telefonu nečitelné. Hero ${Math.round(H * 100)} % výšky${H > 0.55 ? " – na mobilu příliš, produkty jsou daleko dole" : ""}.`;
    }
  }
  [cols, hero, gr, an].forEach(i => i.addEventListener("input", draw)); draw();
  window.addEventListener("resize", draw);
};

/* ---------- Úběžníková perspektiva ---------- */
W.perspektiva = root => {
  const svg = q("svg", root), hor = q("[data-hor]", root), dist = q("[data-dist]", root), cary = q("[data-cary]", root), out = q("[data-out]", root);
  let typ = "1"; [hor, dist].forEach(bindRange);
  seg(q("[data-typ]", root), v => { typ = v; draw(); });
  const Wd = 640, Hd = 360;
  const line = (a, b, attrs) => el("line", Object.assign({x1: a[0], y1: a[1], x2: b[0], y2: b[1]}, attrs));
  const poly = (pts, attrs) => el("polygon", Object.assign({points: pts.map(p => p.join(",")).join(" ")}, attrs));
  // bod na přímce z P směrem k V ve zlomku t
  const toward = (P, V, t) => [P[0] + (V[0] - P[0]) * t, P[1] + (V[1] - P[1]) * t];
  function draw(){
    svg.innerHTML = "";
    const hy = 40 + (Hd - 80) * (+hor.value / 100), D = +dist.value / 100;
    svg.appendChild(el("rect", {x: 0, y: 0, width: Wd, height: Hd, fill: "#F8F5EE"}));
    svg.appendChild(el("rect", {x: 0, y: hy, width: Wd, height: Hd - hy, fill: "#EFE9DC"}));
    const guide = {stroke: "#C8257A", "stroke-width": .8, "stroke-dasharray": "4 3", opacity: .8};
    const edge = {fill: "none", stroke: "#23272D", "stroke-width": 1.6, "stroke-linejoin": "round"};
    const cx = Wd / 2, cy = Hd / 2 + 30;
    if (typ !== "izo"){
      svg.appendChild(line([0, hy], [Wd, hy], {stroke: "#0F5673", "stroke-width": 1.2}));
      svg.appendChild(txt(8, hy + 14, "horizont (výška očí)", "g-txt2", {"font-size": 10, fill: "#0F5673"}));
    }
    let faces = [], vps = [], g = el("g");
    if (typ === "1"){
      const V = [cx, hy]; vps = [V];
      const w = 150, h = 100, fx = cx - 210, fy = cy - h / 2 + 45;
      const F = [[fx, fy], [fx + w, fy], [fx + w, fy + h], [fx, fy + h]];
      const t = 0.45 * D + 0.1;
      const B = F.map(p => toward(p, V, t));
      if (cary.checked) F.forEach(p => g.appendChild(line(p, V, guide)));
      g.appendChild(poly(B, Object.assign({}, edge, {fill: "#C9B38F"})));
      if (V[0] > fx + w) g.appendChild(poly([F[1], B[1], B[2], F[2]], Object.assign({}, edge, {fill: "#B89C73"})));
      if (V[0] < fx) g.appendChild(poly([F[0], B[0], B[3], F[3]], Object.assign({}, edge, {fill: "#B89C73"})));
      if (V[1] < fy) g.appendChild(poly([F[0], B[0], B[1], F[1]], Object.assign({}, edge, {fill: "#E6D2B0"})));
      if (V[1] > fy + h) g.appendChild(poly([F[3], B[3], B[2], F[2]], Object.assign({}, edge, {fill: "#A58962"})));
      g.appendChild(poly(F, Object.assign({}, edge, {fill: "#D9C3A0"})));
    } else if (typ === "2" || typ === "3"){
      const L = [cx - Wd * .5 * D - 40, hy], R = [cx + Wd * .5 * D + 40, hy]; vps = [L, R];
      const h = 120, ex = cx - 20, top = cy - h / 2 + 20, bot = top + h;
      let V3 = null;
      if (typ === "3"){ V3 = hy < Hd / 2 ? [cx, hy + 520 * (1.3 - D)] : [cx, hy - 520 * (1.3 - D)]; vps.push(V3); }
      const tL = 0.28 * D + 0.14, tR = 0.22 * D + 0.12;
      let E0 = [ex, top], E1 = [ex, bot];
      let A0 = toward(E0, L, tL), A1 = toward(E1, L, tL), C0 = toward(E0, R, tR), C1 = toward(E1, R, tR);
      // zadní hrana: průsečík přímek A0→R a C0→L
      function inter(p1, p2, p3, p4){ const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]); const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d; return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]; }
      let D0 = inter(A0, R, C0, L), D1 = inter(A1, R, C1, L);
      if (V3){ // svislice se sbíhají k třetímu úběžníku
        const k = 0.22;
        const fix = (P, Q) => V3[1] > hy ? [toward(P, V3, -k * .4), toward(Q, V3, k)] : [toward(P, V3, k), toward(Q, V3, -k * .4)];
        let e; e = fix(E0, E1); E0 = e[0]; E1 = e[1]; e = fix(A0, A1); A0 = e[0]; A1 = e[1]; e = fix(C0, C1); C0 = e[0]; C1 = e[1]; e = fix(D0, D1); D0 = e[0]; D1 = e[1];
      }
      if (cary.checked){ [E0, E1, A0, A1, C0, C1].forEach(p => { g.appendChild(line(p, L, guide)); g.appendChild(line(p, R, guide)); }); if (V3) [E0, A0, C0, E1, A1, C1].forEach(p => g.appendChild(line(p, V3, Object.assign({}, guide, {stroke: "#D9A400"})))); }
      g.appendChild(poly([E0, A0, A1, E1], Object.assign({}, edge, {fill: "#B89C73"})));
      g.appendChild(poly([E0, C0, C1, E1], Object.assign({}, edge, {fill: "#D9C3A0"})));
      if (hy < top) g.appendChild(poly([E0, A0, D0, C0], Object.assign({}, edge, {fill: "#E6D2B0"})));
      if (hy > bot) g.appendChild(poly([E1, A1, D1, C1], Object.assign({}, edge, {fill: "#A58962"})));
    } else {
      const s = 90, a = Math.PI / 6, dx = Math.cos(a) * s, dy = Math.sin(a) * s, h = 100;
      const O = [cx, cy + 50];
      const P = [O, [O[0] + dx, O[1] - dy], [O[0] + dx, O[1] - dy - h], [O[0], O[1] - h], [O[0] - dx, O[1] - dy], [O[0] - dx, O[1] - dy - h], [O[0], O[1] - 2 * dy - h]];
      g.appendChild(poly([P[0], P[1], P[2], P[3]], Object.assign({}, edge, {fill: "#D9C3A0"})));
      g.appendChild(poly([P[0], P[4], P[5], P[3]], Object.assign({}, edge, {fill: "#B89C73"})));
      g.appendChild(poly([P[3], P[2], P[6], P[5]], Object.assign({}, edge, {fill: "#E6D2B0"})));
      if (cary.checked){ [[P[0], P[1]], [P[3], P[2]], [P[5], P[6]], [P[0], P[4]], [P[3], P[5]], [P[2], P[6]]].forEach(([a, b]) => { const dxx = b[0] - a[0], dyy = b[1] - a[1]; g.appendChild(line([a[0] - dxx * 2, a[1] - dyy * 2], [b[0] + dxx * 2, b[1] + dyy * 2], guide)); }); }
      g.appendChild(txt(cx, Hd - 14, "osy po 120°, rovnoběžky zůstávají rovnoběžné, žádný úběžník", "g-txt2", {"text-anchor": "middle", "font-size": 11}));
    }
    svg.appendChild(g);
    vps.forEach((V, i) => { svg.appendChild(el("circle", {cx: Math.max(6, Math.min(Wd - 6, V[0])), cy: Math.max(6, Math.min(Hd - 6, V[1])), r: 5, fill: i === 2 ? "#D9A400" : "#C8257A"})); svg.appendChild(txt(Math.max(10, Math.min(Wd - 30, V[0] + 8)), Math.max(14, Math.min(Hd - 8, V[1] - 8)), i === 2 ? "Ú3" : "Ú" + (i + 1), "g-txt2", {"font-size": 10, fill: "#C8257A"})); });
    const pohled = +hor.value > 65 ? "Žabí pohled (horizont nízko – objekt působí monumentálně, vidíš spodek)" : +hor.value < 35 ? "Ptačí pohled (horizont vysoko – vidíš vršek)" : "Pohled z výšky očí – horizont protíná objekt.";
    const n = {"1": "Jednoúběžníková (průčelná): přední stěna nezkreslená, hloubkové hrany míří do jednoho úběžníku na horizontu.", "2": "Dvouúběžníková (nárožní): obě sady vodorovných hran míří do dvou úběžníků na horizontu, svislice zůstávají svislé.", "3": "Tříúběžníková: i svislice se sbíhají do třetího úběžníku " + (+hor.value < 50 ? "pod" : "nad") + " horizontem – dramatický pohled.", "izo": "Izometrie: paralelní projekce bez úběžníků, hloubka se nezkracuje; technické ilustrace, hry, ikony."}[typ];
    out.innerHTML = `<b>${n}</b> ${typ !== "izo" ? pohled + ". " : ""}${typ !== "izo" && D < 0.4 ? "Úběžníky blízko = široký objektiv, silné zkreslení." : typ !== "izo" && D > 0.85 ? "Úběžníky daleko = dlouhý objektiv, mírné sbíhání (skoro axonometrie)." : ""}`;
  }
  [hor, dist, cary].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Kompoziční schémata ---------- */
W.kompozice = root => {
  const svg = q("svg", root), mx = q("[data-mx]", root), my = q("[data-my]", root), hz = q("[data-hz]", root), out = q("[data-out]", root);
  let schema = "tretiny"; [mx, my, hz].forEach(bindRange);
  seg(q("[data-schema]", root), v => { schema = v; draw(); });
  const Wd = 640, Hd = 400, PHI = 0.618;
  const line = (x1, y1, x2, y2, attrs) => el("line", Object.assign({x1, y1, x2, y2}, attrs));
  function draw(){
    svg.innerHTML = "";
    const X = Wd * (+mx.value / 100), Y = Hd * (+my.value / 100), H = Hd * (+hz.value / 100);
    svg.appendChild(el("rect", {x: 0, y: 0, width: Wd, height: Hd, fill: "#CFE3EC"}));
    svg.appendChild(el("rect", {x: 0, y: H, width: Wd, height: Hd - H, fill: "#8FAE6B"}));
    svg.appendChild(el("path", {d: `M0 ${H} Q ${Wd * .3} ${H - 50} ${Wd * .55} ${H} T ${Wd} ${H - 10} L${Wd} ${H + 2} L0 ${H + 2}Z`, fill: "#7A9A5A"}));
    svg.appendChild(el("circle", {cx: Wd * .18, cy: H * .45, r: 26, fill: "#F2D06B"}));
    const cesta = el("path", {d: `M${Wd * .1} ${Hd} C ${Wd * .3} ${Hd - 60} ${X - 60} ${Y + 40} ${X} ${Math.max(H + 6, Y)}`, fill: "none", stroke: "#D9C3A0", "stroke-width": 10, "stroke-linecap": "round", opacity: .8});
    svg.appendChild(cesta);
    // hlavní motiv: strom
    const r = 42, kmenH = 60;
    const strom = el("g");
    strom.appendChild(el("rect", {x: X - 6, y: Y - kmenH / 2, width: 12, height: kmenH, fill: "#6B4A2B"}));
    strom.appendChild(el("circle", {cx: X, cy: Y - kmenH / 2 - r * .6, r, fill: "#3F6B35"}));
    strom.appendChild(el("circle", {cx: X - 20, cy: Y - kmenH / 2 - r * .3, r: r * .7, fill: "#47763B"}));
    strom.appendChild(el("circle", {cx: X + 22, cy: Y - kmenH / 2 - r * .3, r: r * .7, fill: "#47763B"}));
    svg.appendChild(strom);
    // vedlejší motiv (vyvážení)
    svg.appendChild(el("g", {transform: `translate(${Wd - X} ${Math.max(H + 10, Y)}) scale(.45)`}, [el("rect", {x: -6, y: -30, width: 12, height: 60, fill: "#6B4A2B"}), el("circle", {cx: 0, cy: -55, r: 42, fill: "#3F6B35"})]));
    const ov = {stroke: "#C8257A", "stroke-width": 1.5, fill: "none", opacity: .9}, ovd = Object.assign({}, ov, {"stroke-dasharray": "6 4"});
    const o = el("g");
    if (schema === "tretiny"){
      [1, 2].forEach(i => { o.appendChild(line(Wd * i / 3, 0, Wd * i / 3, Hd, ovd)); o.appendChild(line(0, Hd * i / 3, Wd, Hd * i / 3, ovd)); });
      [1, 2].forEach(i => [1, 2].forEach(j => o.appendChild(el("circle", {cx: Wd * i / 3, cy: Hd * j / 3, r: 7, fill: "#C8257A", opacity: .8}))));
    } else if (schema === "zlaty"){
      [1 - PHI, PHI].forEach(t => { o.appendChild(line(Wd * t, 0, Wd * t, Hd, ovd)); o.appendChild(line(0, Hd * t, Wd, Hd * t, ovd)); });
      [1 - PHI, PHI].forEach(a => [1 - PHI, PHI].forEach(b => o.appendChild(el("circle", {cx: Wd * a, cy: Hd * b, r: 7, fill: "#C8257A", opacity: .8}))));
      o.appendChild(txt(Wd * (1 - PHI) + 6, 16, "38,2 %", "g-txt2", {fill: "#C8257A", "font-size": 11})); o.appendChild(txt(Wd * PHI + 6, 16, "61,8 %", "g-txt2", {fill: "#C8257A", "font-size": 11}));
    } else if (schema === "spirala"){
      drawSpiral(o, X < Wd / 2);
    } else if (schema === "diag"){
      o.appendChild(line(0, 0, Wd, Hd, ovd)); o.appendChild(line(0, Hd, Wd, 0, ovd));
      o.appendChild(line(0, Hd, Wd * .5, 0, ov)); o.appendChild(line(Wd, Hd, Wd * .5, 0, ov));
    } else if (schema === "stred"){
      o.appendChild(line(Wd / 2, 0, Wd / 2, Hd, ov)); o.appendChild(line(0, Hd / 2, Wd, Hd / 2, ovd));
      o.appendChild(el("circle", {cx: Wd / 2, cy: Hd / 2, r: 60, fill: "none", stroke: "#C8257A", "stroke-width": 1.5, "stroke-dasharray": "6 4"}));
    } else if (schema === "troj"){
      o.appendChild(el("polygon", {points: `${Wd * .12},${Hd * .9} ${Wd * .88},${Hd * .9} ${Wd / 2},${Hd * .12}`, fill: "none", stroke: "#C8257A", "stroke-width": 1.5}));
    }
    svg.appendChild(o);
    svg.appendChild(el("rect", {x: 0, y: 0, width: Wd, height: Hd, fill: "none", stroke: "#23272D", "stroke-width": 2}));
    // hodnocení polohy motivu
    const nx = X / Wd, ny = Y / Hd;
    const near = (v, t) => Math.abs(v - t) < 0.06;
    let poloha;
    if (near(nx, .5) && near(ny, .5)) poloha = "Motiv přesně uprostřed – centrální, statická kompozice (vhodná pro symetrii, portrét, logo; v krajině nudná).";
    else if ((near(nx, 1 / 3) || near(nx, 2 / 3)) && (near(ny, 1 / 3) || near(ny, 2 / 3))) poloha = "Motiv na průsečíku třetin – klasické pravidlo třetin, přirozeně vyvážené.";
    else if ((near(nx, PHI) || near(nx, 1 - PHI)) && (near(ny, PHI) || near(ny, 1 - PHI))) poloha = "Motiv ve zlatém bodu – dynamická, ale harmonická kompozice.";
    else if (nx < .1 || nx > .9 || ny < .12) poloha = "Motiv těsně u okraje – „vypadává“ z obrazu, chybí prostor před ním.";
    else poloha = "Motiv mimo schéma – asymetrická kompozice; vyváží ho menší prvek na opačné straně (malý strom vpravo/vlevo).";
    const hzt = near(+hz.value / 100, .5) ? "Horizont v polovině půlí obraz – nerozhodné; dej ho na třetinu." : +hz.value < 45 ? "Horizont vysoko v obraze – důraz na zem, popředí, cestu." : "Horizont nízko – důraz na oblohu, vzdušnost.";
    const sch = {tretiny: "Pravidlo třetin: zjednodušený zlatý řez (33 % místo 38 %).", zlaty: "Zlatý řez: linie na 38,2 a 61,8 %, průsečíky = zlaté body.", spirala: "Zlatá spirála: oko sleduje čtvrtkruhy do ohniska – motiv patří do nejmenšího čtverce.", diag: "Diagonály a sbíhající se linie: pohyb, hloubka; cesta vede oko k motivu.", stred: "Centrální / symetrická kompozice: klid, slavnostnost; motiv uprostřed, osa svisle.", troj: "Trojúhelníková: stabilní základna, vrchol nahoře – skupinové portréty, Madony."}[schema];
    out.innerHTML = `<b>${sch}</b> ${poloha} ${hzt}`;
  }
  function drawSpiral(o, flip){
    // zlatá spirála: posloupnost čtverců ve zlatém obdélníku, vepsaná do 640×400 (poměr 1,6)
    const g = el("g", {transform: flip ? `translate(${Wd} 0) scale(-1 1)` : ""});
    let x = 0, y = 0, w = Wd, h = Hd;
    for (let i = 0; i < 9; i++){
      const s = Math.min(w, h); let sq, arc;
      switch (i % 4){
        case 0: sq = [x, y, s]; arc = `M${x} ${y + s} A${s} ${s} 0 0 1 ${x + s} ${y}`; x += s; w -= s; break; // levý čtverec, oblouk z levého dolního do pravého horního
        case 1: sq = [x, y, s]; arc = `M${x} ${y} A${s} ${s} 0 0 1 ${x + s} ${y + s}`; y += s; h -= s; break;   // horní čtverec
        case 2: sq = [x + w - s, y + h - s, s]; arc = `M${x + w} ${y + h - s} A${s} ${s} 0 0 1 ${x + w - s} ${y + h}`; w -= s; break; // pravý čtverec
        case 3: sq = [x, y + h - s, s]; arc = `M${x + s} ${y + h} A${s} ${s} 0 0 1 ${x} ${y + h - s}`; h -= s; break; // dolní čtverec
      }
      g.appendChild(el("rect", {x: sq[0], y: sq[1], width: sq[2], height: sq[2], fill: "none", stroke: "#C8257A", "stroke-width": .7, opacity: .5}));
      g.appendChild(el("path", {d: arc, fill: "none", stroke: "#C8257A", "stroke-width": 2}));
    }
    o.appendChild(g);
  }
  [mx, my, hz].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Zlatý řez ---------- */
W.zlatyrez = root => {
  const svg = q("svg", root), len = q("[data-len]", root), kr = q("[data-kroky]", root), fib = q("[data-fib]", root), out = q("[data-out]", root);
  [len, kr].forEach(bindRange);
  const PHI = (1 + Math.sqrt(5)) / 2;
  function draw(){
    svg.innerHTML = "";
    const L = +len.value, K = +kr.value;
    // zlatý obdélník 420 × 260 (poměr 1,618)
    const W0 = 372, H0 = W0 / PHI, ox = 20, oy = 20;
    svg.appendChild(el("rect", {x: ox, y: oy, width: W0, height: H0, fill: "#F4F0E7", stroke: "#23272D", "stroke-width": 1.5}));
    let x = ox, y = oy, w = W0, h = H0;
    for (let i = 0; i < K; i++){
      const s = Math.min(w, h); let sq, arc;
      switch (i % 4){
        case 0: sq = [x, y, s]; arc = `M${x} ${y + s} A${s} ${s} 0 0 1 ${x + s} ${y}`; x += s; w -= s; break;
        case 1: sq = [x, y, s]; arc = `M${x} ${y} A${s} ${s} 0 0 1 ${x + s} ${y + s}`; y += s; h -= s; break;
        case 2: sq = [x + w - s, y + h - s, s]; arc = `M${x + w} ${y + h - s} A${s} ${s} 0 0 1 ${x + w - s} ${y + h}`; w -= s; break;
        case 3: sq = [x, y + h - s, s]; arc = `M${x + s} ${y + h} A${s} ${s} 0 0 1 ${x} ${y + h - s}`; h -= s; break;
      }
      svg.appendChild(el("rect", {x: sq[0], y: sq[1], width: sq[2], height: sq[2], fill: ["#E6D2B0", "#D9C3A0", "#CBB48F", "#BFA67F"][i % 4], stroke: "#23272D", "stroke-width": .8}));
      svg.appendChild(el("path", {d: arc, fill: "none", stroke: "#C8257A", "stroke-width": 2.2}));
      if (sq[2] > 22) svg.appendChild(txt(sq[0] + sq[2] / 2, sq[1] + sq[2] / 2 + 4, fib.checked ? String([34, 21, 13, 8, 5, 3, 2, 1][i]) : fmt(L / Math.pow(PHI, i + 1), 0), "g-txt", {"text-anchor": "middle", "font-size": Math.min(16, sq[2] / 3)}));
    }
    svg.appendChild(txt(ox, oy + H0 + 16, `zlatý obdélník 1 : ${fmt(PHI, 3)} – odříznutý čtverec nechá opět zlatý obdélník`, "g-txt2", {"font-size": 11}));
    // vpravo: konstrukce kružítkem
    const cx = 425, cy = 30, AB = 150;
    const A = [cx, cy + 110], B = [cx + AB, cy + 110], C = [B[0], B[1] - AB / 2];
    const g = el("g");
    g.appendChild(el("line", {x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: "#23272D", "stroke-width": 1.5}));
    g.appendChild(el("line", {x1: B[0], y1: B[1], x2: C[0], y2: C[1], stroke: "#585E66", "stroke-width": 1}));
    g.appendChild(el("line", {x1: A[0], y1: A[1], x2: C[0], y2: C[1], stroke: "#585E66", "stroke-width": 1}));
    const AC = Math.hypot(C[0] - A[0], C[1] - A[1]);
    const Dp = [A[0] + (C[0] - A[0]) * (AC - AB / 2) / AC, A[1] + (C[1] - A[1]) * (AC - AB / 2) / AC];
    const AD = Math.hypot(Dp[0] - A[0], Dp[1] - A[1]);
    const Xp = [A[0] + AD, A[1]];
    g.appendChild(el("path", {d: `M${C[0]} ${C[1] + AB / 2} A${AB / 2} ${AB / 2} 0 0 1 ${Dp[0]} ${Dp[1]}`, fill: "none", stroke: "#0F5673", "stroke-width": 1, "stroke-dasharray": "3 2"}));
    g.appendChild(el("path", {d: `M${Dp[0]} ${Dp[1]} A${AD} ${AD} 0 0 1 ${Xp[0]} ${Xp[1]}`, fill: "none", stroke: "#C8257A", "stroke-width": 1, "stroke-dasharray": "3 2"}));
    g.appendChild(el("circle", {cx: Xp[0], cy: Xp[1], r: 4, fill: "#C8257A"}));
    [["A", A, -6, 16], ["B", B, 0, 16], ["C", C, 6, 0], ["D", Dp, -14, -4], ["X", Xp, -4, -8]].forEach(([n, p, dx, dy]) => g.appendChild(txt(p[0] + dx, p[1] + dy, n, "g-txt", {"font-size": 12})));
    g.appendChild(txt(cx, cy + 140, "1. v B kolmice BC = AB/2", "g-txt2", {"font-size": 9.5}));
    g.appendChild(txt(cx, cy + 154, "2. kružnice (C; CB) ∩ AC = D", "g-txt2", {"font-size": 9.5}));
    g.appendChild(txt(cx, cy + 168, "3. kružnice (A; AD) ∩ AB = X", "g-txt2", {"font-size": 9.5}));
    g.appendChild(txt(cx, cy + 184, "AB : AX = AX : XB = φ", "g-txt2", {"font-size": 9.5, "font-weight": "700"}));
    svg.appendChild(g);
    // dole: úsečka rozdělená
    const ly = 330, lx = 20, lw = 600;
    const a = L / PHI, b = L - a;
    svg.appendChild(el("rect", {x: lx, y: ly - 8, width: lw * (a / L), height: 16, fill: "#B4532A"}));
    svg.appendChild(el("rect", {x: lx + lw * (a / L), y: ly - 8, width: lw * (b / L), height: 16, fill: "#0F5673"}));
    svg.appendChild(txt(lx + lw * (a / L) / 2, ly + 4, `${fmt(a, 1)} mm (61,8 %)`, "g-txt", {"text-anchor": "middle", "font-size": 11, style: "fill:#fff"}));
    svg.appendChild(txt(lx + lw * (a / L) + lw * (b / L) / 2, ly + 4, `${fmt(b, 1)} mm (38,2 %)`, "g-txt", {"text-anchor": "middle", "font-size": 11, style: "fill:#fff"}));
    svg.appendChild(txt(lx, ly - 14, `úsečka ${L} mm rozdělená zlatým řezem`, "g-txt2", {"font-size": 11}));
    const fibs = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
    out.innerHTML = `Délka <b>${L} mm</b>: větší díl <b>${fmt(a, 1)}</b>, menší <b>${fmt(b, 1)}</b>; ${fmt(a, 1)} / ${fmt(b, 1)} = ${fmt(a / b, 3)} = ${fmt(L, 0)} / ${fmt(a, 1)}. ${fib.checked ? "Fibonacci: " + fibs.slice(0, 10).join(", ") + " … 55/34 = " + fmt(55 / 34, 3) + ", 144/89 = " + fmt(144 / 89, 4) + " → φ." : ""} ${L === 297 ? "A4 na výšku: zlatý řez výšky je 183,6 mm – klasická poloha titulku nebo optického středu." : ""}`;
  }
  [len, kr, fib].forEach(i => i.addEventListener("input", draw)); draw();
};

/* ---------- Kánon lidského těla a Modulor ---------- */
W.kanon = root => {
  const svg = q("svg", root), vy = q("[data-vyska]", root), mr = q("[data-mrizka]", root), out = q("[data-out]", root);
  let kanon = "polykleitos"; bindRange(vy);
  seg(q("[data-kanon]", root), v => { kanon = v; if (v === "modulor") { vy.value = 183; vy.dispatchEvent(new Event("input")); } draw(); });
  const K = {
    egypt: {hlav: 7.2, sirka: 1.0, pop: "Egyptská mřížka: stojící postava 18 pěstí (čtverců) od chodidel k vlasové linii; ramena a hlava z profilu, trup zepředu. Stejné proporce po tři tisíciletí.", kdo: "Egypt, Stará říše – Nová říše"},
    polykleitos: {hlav: 7, sirka: 1.15, pop: "Polykleitos (5. stol. př. n. l.), socha Doryforos a spis Kánon: hlava = 1/7 výšky, široká ramena, kontrapost, symetria částí.", kdo: "Polykleitos, klasické Řecko"},
    lysippos: {hlav: 8, sirka: 1.0, pop: "Lysippos (4. stol. př. n. l.): štíhlejší kánon 1 : 8, menší hlava – postava působí vyšší a pohyblivější (Apoxyomenos).", kdo: "Lysippos, pozdní klasika"},
    vitruvius: {hlav: 8, sirka: 1.0, kruh: true, pop: "Vitruvius (De architectura) – tělo v kruhu (střed pupek) a čtverci (rozpětí paží = výška); hlava 1/8, obličej 1/10, chodidlo 1/6. Leonardo: Vitruviánský muž, kolem 1490.", kdo: "Vitruvius / Leonardo da Vinci"},
    modulor: {hlav: 7.6, sirka: 1.0, modulor: true, pop: "Le Corbusier, Modulor (1948): postava 183 cm, zvednutá paže 226, pupek 113 cm; červená řada 113-70-43-27, modrá 226-140-86-53 – zlatý řez.", kdo: "Le Corbusier, 1948"},
    dite: {hlav: 5, sirka: 1.0, pop: "Dítě kolem 5 let: hlava velká – 1/5 výšky, krátké končetiny, polovina výšky nad rozkrokem výš. Kojenec má 4 hlavy, desetileté dítě 7.", kdo: "proporce dítěte"},
    hrdina: {hlav: 8.5, sirka: 1.3, pop: "Heroický/komiksový kánon 8,5–9 hlav: malá hlava, dlouhé nohy, široká ramena (Michelangelo užíval 9 hlav – ideál, ne realita, která má 7,5).", kdo: "komiks, Michelangelo"}
  };
  function draw(){
    svg.innerHTML = "";
    const k = K[kanon], H = +vy.value, n = k.hlav;
    const bot = 390, top = k.modulor ? bot - (bot - 30) * 183 / 226 : 30, Hp = bot - top, hu = Hp / n, cx = 200;
    const sw = k.sirka;
    const g = el("g");
    // mřížka hlav
    if (mr.checked) for (let i = 0; i <= n; i++){ const y = top + i * hu; g.appendChild(el("line", {x1: 60, y1: y, x2: 340, y2: y, stroke: "#C8257A", "stroke-width": .8, "stroke-dasharray": "4 3", opacity: .7})); if (i < n) g.appendChild(txt(62, y + 12, String(i + 1), "g-txt2", {"font-size": 10, fill: "#C8257A"})); }
    // polovina výšky
    g.appendChild(el("line", {x1: 60, y1: top + Hp / 2, x2: 340, y2: top + Hp / 2, stroke: "#0F5673", "stroke-width": 1.2}));
    g.appendChild(txt(12, top + Hp / 2 - 4, "½ výšky", "g-txt2", {"font-size": 10, fill: "#0F5673"}));
    // postava z elips a obdélníků
    const skin = "#D9B99B", cloth = "#0F5673";
    const hw = hu * .68 * (kanon === "dite" ? 1.05 : 1);
    g.appendChild(el("ellipse", {cx, cy: top + hu / 2, rx: hw / 2, ry: hu / 2, fill: skin, stroke: "#23272D", "stroke-width": 1}));
    const krk = hu * .25, ramY = top + hu + krk, ramW = hu * 2.1 * sw, pasY = top + hu * (n * .42), pasW = ramW * .72, rozY = top + Hp / 2, bokW = ramW * .8;
    g.appendChild(el("rect", {x: cx - hu * .12, y: top + hu, width: hu * .24, height: krk + 2, fill: skin}));
    g.appendChild(el("path", {d: `M${cx - ramW / 2} ${ramY} L${cx + ramW / 2} ${ramY} L${cx + pasW / 2} ${pasY} L${cx + bokW / 2} ${rozY} L${cx - bokW / 2} ${rozY} L${cx - pasW / 2} ${pasY} Z`, fill: cloth, stroke: "#23272D", "stroke-width": 1}));
    // paže: loket u pasu, zápěstí u rozkroku, prsty v polovině stehna
    const armL = (rozY + hu * .7) - ramY, aw = hu * .3;
    [-1, 1].forEach(s => {
      const ax = cx + s * (ramW / 2 + aw * .55);
      if (kanon === "modulor" && s === 1){ // zvednutá paže
        g.appendChild(el("rect", {x: ax - aw / 2, y: 30, width: aw, height: ramY - 30, rx: aw / 2, fill: skin, stroke: "#23272D", "stroke-width": 1})); g.appendChild(el("line", {x1: 60, y1: 30, x2: 340, y2: 30, stroke: "#0F5673", "stroke-width": 1, "stroke-dasharray": "3 3"})); g.appendChild(txt(62, 26, "226 cm", "g-txt2", {"font-size": 10, fill: "#0F5673"}));
      } else g.appendChild(el("rect", {x: ax - aw / 2, y: ramY, width: aw, height: armL, rx: aw / 2, fill: skin, stroke: "#23272D", "stroke-width": 1}));
    });
    // nohy
    const lw = hu * .42;
    [-1, 1].forEach(s => g.appendChild(el("rect", {x: cx + s * bokW / 4 - lw / 2, y: rozY - 4, width: lw, height: bot - rozY + 4, rx: lw / 2, fill: cloth, stroke: "#23272D", "stroke-width": 1})));
    [-1, 1].forEach(s => g.appendChild(el("ellipse", {cx: cx + s * bokW / 4 + s * 4, cy: bot, rx: lw * .8, ry: 5, fill: skin, stroke: "#23272D", "stroke-width": 1})));
    // orientační body
    const body = [[ramY + hu * .9, "bradavky"], [pasY, "pas / pupek"], [rozY, "rozkrok"], [rozY + (bot - rozY) * .5, "kolena"]];
    body.forEach(([y, t]) => { g.appendChild(el("circle", {cx: cx + ramW / 2 + 30, cy: y, r: 3, fill: "#B4532A"})); g.appendChild(txt(cx + ramW / 2 + 38, y + 4, t, "g-txt2", {"font-size": 10})); });
    if (k.kruh){ g.appendChild(el("circle", {cx, cy: pasY + hu * .1, r: (bot - pasY - hu * .1), fill: "none", stroke: "#B4532A", "stroke-width": 1, "stroke-dasharray": "5 3"})); g.appendChild(el("rect", {x: cx - Hp / 2, y: top, width: Hp, height: Hp, fill: "none", stroke: "#B4532A", "stroke-width": 1, "stroke-dasharray": "5 3"})); g.appendChild(txt(cx - Hp / 2 + 4, top + 12, "čtverec: rozpětí paží = výška", "g-txt2", {"font-size": 9, fill: "#B4532A"})); }
    svg.appendChild(g);
    // Modulor vpravo
    const m = el("g", {transform: "translate(430 0)"});
        const base = bot;
    const cm = v => base - v * ((bot - 30) / 226);
    m.appendChild(el("line", {x1: 0, y1: base, x2: 190, y2: base, stroke: "#23272D", "stroke-width": 1.5}));
    const R = [113, 70, 43, 27, 16.5, 10], B = [226, 140, 86, 53, 33, 20];
    R.forEach(v => { m.appendChild(el("line", {x1: 20, y1: cm(v), x2: 80, y2: cm(v), stroke: "#C8257A", "stroke-width": 2})); m.appendChild(txt(84, cm(v) + 4, fmt(v, v % 1 ? 1 : 0), "g-txt2", {"font-size": 10, fill: "#C8257A"})); });
    B.forEach(v => { m.appendChild(el("line", {x1: 110, y1: cm(v), x2: 170, y2: cm(v), stroke: "#0F5673", "stroke-width": 2})); m.appendChild(txt(174, cm(v) + 4, fmt(v, 0), "g-txt2", {"font-size": 10, fill: "#0F5673"})); });
    m.appendChild(txt(20, 12, "červená řada", "g-txt2", {"font-size": 10, fill: "#C8257A", "font-weight": "700"}));
    m.appendChild(txt(120, 12, "modrá řada", "g-txt2", {"font-size": 10, fill: "#0F5673", "font-weight": "700"}));
    m.appendChild(el("line", {x1: 0, y1: cm(183), x2: 190, y2: cm(183), stroke: "#23272D", "stroke-width": .8, "stroke-dasharray": "3 3"})); m.appendChild(txt(2, cm(183) - 3, "183 postava", "g-txt2", {"font-size": 9}));
    m.appendChild(txt(2, cm(226) + 12, "226 = zvednutá paže", "g-txt2", {"font-size": 9}));
    svg.appendChild(m);
    const hlavaCm = H / n;
    out.innerHTML = `<b>${k.kdo}</b> – ${k.pop} Při výšce <b>${H} cm</b> má hlava ${fmt(hlavaCm, 1)} cm, polovina výšky (rozkrok) je v ${fmt(H / 2, 0)} cm. ${kanon === "modulor" ? "Na pravé straně obě řady Modulor: každé číslo = předchozí / φ; 113 je polovina 226 a zároveň výška pupku." : "Vpravo pro srovnání řady Modulor (183/226 cm)."}`;
  }
  [vy, mr].forEach(i => i.addEventListener("input", draw)); draw();
};

window.WIDGETY = W;
document.addEventListener("DOMContentLoaded", () => {
  qa("[data-widget]").forEach(root => { const f = W[root.dataset.widget]; if (f){ try { f(root); } catch(e){ console.error("widget", root.dataset.widget, e); } } });
});
})();
