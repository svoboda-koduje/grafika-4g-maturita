#!/usr/bin/env python3
"""Generátor webu Grafika 4.G – maturita (SPŠE a VOŠ Pardubice).
Spuštění:  python3 build.py   → výstup do ./out/grafika-4g-maturita
Zdroje stránek: src/stranky/*.html (průřezové stránky) a src/lekce/*.html (23 lekcí).
Každý zdroj začíná řádkem <!--META {...json...} --> a pak následuje obsah <main>.
"""
import json, os, re, shutil, html

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "out", "grafika-4g-maturita")
# assets/ a img/ leží vedle build.py; při spuštění ze složky _zdroj/ uvnitř hotového webu o úroveň výš
STATIC = ROOT if os.path.isdir(os.path.join(ROOT, "assets")) else os.path.dirname(ROOT)

SITE = "Grafika 4.G – příprava k maturitě"
SITE_SHORT = "Grafika · 4. ročník"
ROK = "2026/2027"

ODKAZY = {
    "onedrive": "https://spsecz-my.sharepoint.com/:f:/g/personal/svoboda_spse_cz/IgCL6VptB1jkQJ0z_LQ3RH-0ARRZTTk3KSLjiuqF4ULQWRo?e=bpRrNk",
    "videa1": "https://spsecz-my.sharepoint.com/:f:/g/personal/svoboda_spse_cz/IgBsMie3M1okQ7g4IVhI68beAUF3tx3zk4Y2C67ARbQtynQ?e=S4OoFC",
    "videa2": "https://spsecz-my.sharepoint.com/:f:/g/personal/svoboda_spse_cz/IgDRoAgwE7GoTZOF1_uRhSyFAWQTPbhqH0UPXeD8cEDhO6o?e=kEVC4S",
    "skript_styly": "https://spsecz-my.sharepoint.com/:f:/g/personal/svoboda_spse_cz/Ek7bCjiFkPVCtp4StAuYbHAB5fqNSUqhXwvA4aolYgDovg?e=Bo3d8P",
    "skript_grep": "https://spsecz-my.sharepoint.com/:u:/g/personal/svoboda_spse_cz/ETBV34pPy8dKkKt8tlcsEKsBcrN6MxY_tBZOw8-g8Y3Mwg?e=fXLRyA",
    "typoskript": "https://spsecz-my.sharepoint.com/:u:/g/personal/svoboda_spse_cz/IQCxoibOwMc2T6gd43icRGicAU562Fj13kVw0gqMe6L9fuA?e=",
    "vs": "https://svoboda-koduje.github.io/vysoke_skoly_s_tvurcimy_obory/",
    "souteze": "https://svoboda-koduje.github.io/spse_seznam_soutezi/",
    "aj": "https://svoboda-koduje.github.io/odborne_anglicke_terminy/#obor=pg&rocnik=1",
    "dejiny": "https://svoboda-koduje.github.io/dejiny_umeni/",
    "kresba": "https://svoboda-koduje.github.io/graficka-tvorba-kresba/",
    "malba": "https://svoboda-koduje.github.io/graficka-tvorba-malba/",
    "enviro": "https://svoboda-koduje.github.io/enviro-projekty-3g/",
    "enviro_paleta": "https://svoboda-koduje.github.io/enviro-projekty-3g/vyuka/01-barevna-paleta.html",
    "enviro_mood": "https://svoboda-koduje.github.io/enviro-projekty-3g/vyuka/02-moodboard.html",
    "enviro_anim": "https://svoboda-koduje.github.io/enviro-projekty-3g/vyuka/03-animace-socialni-site.html",
    "enviro_obal": "https://svoboda-koduje.github.io/enviro-projekty-3g/vyuka/04-obal-pos-pop.html",
}

# Skupiny lekcí v didaktickém pořadí (pořadí v menu i ve stránkování)
SKUPINY = [
    ("zaklady",     "Základy grafiky",          "Základy",     [1, 5, 22]),
    ("illustrator", "Adobe Illustrator",        "Illustrator", [2, 9, 13]),
    ("photoshop",   "Adobe Photoshop",          "Photoshop",   [3, 10, 11, 23]),
    ("indesign",    "InDesign a typografie",    "InDesign",    [6, 4, 21, 14, 15, 7, 12]),
    ("design",      "Design a výtvarná teorie", "Design",      [8, 16]),
    ("dejiny",      "Dějiny umění",             "Dějiny",      [17, 18, 19, 20]),
]

# Číslo otázky → (slug, název otázky tak, jak ji žáci znají, krátký podtitul do menu)
LEKCE = {
    1:  ("formaty-souboru",        "Formáty grafických souborů",                                  "bitmapa × vektor, tisk × web"),
    2:  ("illustrator-zaklady",    "Adobe Illustrator – základní ovládání",                       "plátna, Cestář, bannery, spadávka"),
    3:  ("photoshop-zaklady",      "Adobe Photoshop – základní ovládání",                         "masky, kanály, výběry, DPI"),
    4:  ("odstavcove-styly",       "InDesign – odstavcové styly, vzorové stránky, obsah",          "styly, paginace, generovaný obsah"),
    5:  ("barevne-modely",         "Barevné modely a jejich praktická aplikace",                  "RGB, CMYK, Lab, HSB, gamut"),
    6:  ("pismo-typografie",       "Písmo a typografie",                                          "osnova, kerning, proklad, pravidla"),
    7:  ("manual-loga",            "InDesign – manuál loga",                                      "šablona, kapitoly, kritéria loga"),
    8:  ("obalovy-design",         "Obalový design",                                              "2D síť, 3D vizualizace, e-shop"),
    9:  ("tvorba-loga",            "Illustrator – tvorba loga, základní zásady",                  "zásady, varianty, chyby"),
    10: ("digitalni-malba",        "Photoshop – digitální malba, štětce a stopy",                 "A3 CMYK, štětce, vrstvy"),
    11: ("mockup",                 "Photoshop – transformace, vytvoření mock-upu",                "inteligentní objekty, masky"),
    12: ("e-knihy",                "InDesign – formáty e-knih, ePub, mobi",                       "TOC, obálka, export"),
    13: ("vektory-vzorky-symboly", "Illustrator – vektorové objekty, vzorek a symbol",            "Objekt, Výběr, knihovna symbolů"),
    14: ("brozura-archova-montaz", "InDesign – sazba brožury + archová montáž",                   "A5, tiráž, vazby V1–V9"),
    15: ("dl-letak",               "Grafická úprava DL letáku",                                   "třetiny, ohyby, zrcadlo sazby"),
    16: ("perspektiva-kompozice",  "Perspektiva, techniky, kompozice, zlatý řez, modulor",        "výtvarná teorie v prezentaci"),
    17: ("dejiny-pravek",          "Dějiny umění – pravěk",                                       "paleolit až doba železná"),
    18: ("dejiny-starovek",        "Dějiny umění – starověk",                                     "Egypt, Mezopotámie, Řecko, Řím"),
    19: ("dejiny-stredovek",       "Dějiny umění – středověk",                                    "Byzanc, románský sloh, gotika"),
    20: ("dejiny-novovek",         "Dějiny umění – novověk",                                      "renesance až současnost"),
    21: ("import-wordu",           "InDesign – import textu z Wordu, znakové a odstavcové styly", "turistický průvodce A4 → A5"),
    22: ("typy-pdf",               "PDF – typy PDF, vytvoření a úpravy",                          "PDF/X, PDF/A, interaktivní, web"),
    23: ("animace-banner-video",   "Reklamní animovaná webová grafika",                           "GIF banner, video Full HD"),
}

STRANKY = [  # (soubor, název v menu)
    ("kontrola.html", "Kontrola před odevzdáním"),
    ("cviceni.html",  "Cvičení 1. pololetí"),
    ("videa.html",    "Videotutoriály"),
    ("zdroje.html",   "Zdroje a skripty"),
]

def poradi_lekci():
    out = []
    for key, nazev, pism, cisla in SKUPINY:
        for c in cisla:
            out.append(c)
    return out

PORADI = poradi_lekci()

def skupina_lekce(c):
    for key, nazev, pism, cisla in SKUPINY:
        if c in cisla:
            return key, nazev, pism
    raise KeyError(c)

def href_lekce(c, rel):
    slug = LEKCE[c][0]
    return f"{rel}lekce/{c:02d}-{slug}.html"

ICON_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
ICON_CLOUD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/></svg>'
ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>'
ICON_CAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4"/></svg>'
ICON_TROPHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4"/></svg>'
ICON_AJ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7M7.5 5v2c0 3-2 6-4.5 7.5M5 9c1.5 2.5 3.5 4.5 6 5.5"/><path d="M13 19l3.5-9 3.5 9M14.3 16h4.4"/></svg>'


def menu(rel, aktivni_soubor):
    """Hlavní navigace. rel = '' pro kořen, '../' pro lekce."""
    li = [f'<li><a href="{rel}index.html"{" class=\"active\"" if aktivni_soubor == "index.html" else ""}><span class="num">⌂</span>Úvod</a></li>']
    for key, nazev, pism, cisla in SKUPINY:
        akt = any(aktivni_soubor == os.path.basename(href_lekce(c, rel)) for c in cisla)
        items = []
        for c in cisla:
            slug, titul, pod = LEKCE[c]
            a_akt = aktivni_soubor == os.path.basename(href_lekce(c, rel))
            items.append(f'<a href="{href_lekce(c, rel)}"{" class=\"active\"" if a_akt else ""}><span class="num">{c:02d}</span><span>{html.escape(titul)}<small>{html.escape(pod)}</small></span></a>')
        li.append(f'<li class="grp sk-{key}"><button type="button" aria-expanded="false" aria-haspopup="true"{" class=\"active\"" if akt else ""}><span class="full">{nazev}</span><span class="short">{pism}</span>{ICON_CHEV}</button><div class="drop"><span class="grp-label">{nazev}</span>{"".join(items)}</div></li>')
    # průřezové stránky
    items = []
    for soubor, nazev in STRANKY:
        a_akt = aktivni_soubor == soubor
        items.append(f'<a href="{rel}{soubor}"{" class=\"active\"" if a_akt else ""}><span class="num">+</span><span>{nazev}</span></a>')
    akt = any(aktivni_soubor == s for s, n in STRANKY)
    li.append(f'<li class="grp sk-plus"><button type="button" aria-expanded="false" aria-haspopup="true"{" class=\"active\"" if akt else ""}>K maturitě{ICON_CHEV}</button><div class="drop"><span class="grp-label">K maturitě</span>{"".join(items)}</div></li>')
    # externí odkazy jsou v topbaru; v rozbalovacím (mobilním) menu se zobrazí jako položky
    li.append(f'<li class="jen-mobil"><a class="back" href="{ODKAZY["vs"]}" target="_blank" rel="noopener">{ICON_CAP}Rozcestník vysokých škol s tvůrčími obory</a></li>')
    li.append(f'<li class="jen-mobil"><a class="back" href="{ODKAZY["souteze"]}" target="_blank" rel="noopener">{ICON_TROPHY}Výtvarné a grafické soutěže</a></li>')
    li.append(f'<li class="jen-mobil"><a class="back" href="{ODKAZY["aj"]}" target="_blank" rel="noopener">{ICON_AJ}Odborné anglické termíny</a></li>')
    return "<ul>" + "".join(li) + "</ul>"


def hlavicka(rel, aktivni_soubor, stitek_b, stitek_s):
    return f'''<a class="skip" href="#obsah">Přeskočit na obsah</a>
<div class="progress" id="progress" aria-hidden="true"></div>
<canvas id="bg" aria-hidden="true"></canvas>

<div class="topbar">
  <div class="wrap">
    <nav aria-label="Školní odkazy">
      <a class="skola" href="https://i4.spse.cz/">Intranet</a>
      <a class="skola" href="https://supl.spse.cz/">Suplování</a>
      <a class="skola" href="https://rozvrh.spse.cz/">Rozvrh</a>
      <a class="od" href="{ODKAZY["onedrive"]}" target="_blank" rel="noopener">{ICON_CLOUD}Výukové soubory 4.G (OneDrive)</a>
      <a class="od" href="{rel}videa.html">{ICON_PLAY}Videotutoriály</a>
      <a class="od ext" href="{ODKAZY["vs"]}" target="_blank" rel="noopener" title="Rozcestník vysokých škol s tvůrčími obory">{ICON_CAP}Vysoké školy</a>
      <a class="od ext" href="{ODKAZY["souteze"]}" target="_blank" rel="noopener" title="Přehled dobrovolných výtvarných a grafických soutěží">{ICON_TROPHY}Soutěže</a>
      <a class="od ext" href="{ODKAZY["aj"]}" target="_blank" rel="noopener" title="Odborné anglické termíny pro počítačovou grafiku">{ICON_AJ}Angličtina</a>
    </nav>
    <div class="lesson" id="etapaInfo"><b>{stitek_b}</b><span>{stitek_s}</span></div>
  </div>
</div>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{rel}index.html" aria-label="Úvod – Grafika, 4. ročník">
      <img src="{rel}img/logo-spse.png" alt="SPŠE a VOŠ Pardubice" width="600" height="168">
      <span class="brand-sub"><strong>Grafika – příprava k maturitě</strong>IT – Počítačová grafika, 4. ročník</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>Lekce
    </button>
    <nav class="main-nav" id="menu" aria-label="Lekce a maturitní otázky">
      {menu(rel, aktivni_soubor)}
    </nav>
  </div>
</header>
'''


def paticka(rel):
    return f'''<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="{rel}img/logo-spse-bila.png" alt="SPŠE a VOŠ Pardubice" width="600" height="168">
        <p>Střední průmyslová škola elektrotechnická a Vyšší odborná škola Pardubice<br>Karla IV. 13, 530 02 Pardubice</p>
        <p>Obor 18-20-M/01 Informační technologie · zaměření Počítačová grafika · předmět Grafika (GR), 4. ročník, {ROK}</p>
      </div>
      <div>
        <h4>Výukové weby</h4>
        <p><a href="{ODKAZY["kresba"]}" target="_blank" rel="noopener">Základy kresby (1. ročník)</a></p>
        <p><a href="{ODKAZY["malba"]}" target="_blank" rel="noopener">Ruční a digitální malba (2. ročník)</a></p>
        <p><a href="{ODKAZY["enviro"]}" target="_blank" rel="noopener">Grafika pro klima (3. ročník)</a></p>
        <p><a href="{ODKAZY["dejiny"]}" target="_blank" rel="noopener">Časová osa dějin umění</a></p>
        <p><a href="{ODKAZY["aj"]}" target="_blank" rel="noopener">Odborné anglické termíny</a></p>
      </div>
      <div>
        <h4>Rozcestníky</h4>
        <p><a href="{ODKAZY["vs"]}" target="_blank" rel="noopener">Vysoké školy s tvůrčími obory</a></p>
        <p><a href="{ODKAZY["souteze"]}" target="_blank" rel="noopener">Dobrovolné soutěže</a></p>
        <p><a href="{ODKAZY["onedrive"]}" target="_blank" rel="noopener">Výukové soubory na OneDrive</a></p>
        <p><a href="{rel}zdroje.html">Skripty, dotazy GREP, TypoSkript</a></p>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© {ROK} Mgr. Jaroslav Svoboda, SPŠE a VOŠ Pardubice · obrazové ukázky děl: Wikimedia Commons (volná díla a otevřené licence, viz <a href="{rel}zdroje.html#obrazky">zdroje</a>)</span>
      <span>Web je statický, bez sledování. Vlastní poznámky a stav kvízů se ukládají jen ve vašem prohlížeči.</span>
    </div>
  </div>
  <button class="totop" id="totop" type="button" aria-label="Nahoru"><svg class="ring" viewBox="0 0 54 54"><circle cx="27" cy="27" r="25"/></svg><svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
</footer>'''


def obal(meta, telo, rel, soubor):
    titul = meta["title"]
    popis = meta.get("description", "")
    stitek_b = meta.get("stitek_b", "4. ROČNÍK")
    stitek_s = meta.get("stitek_s", "Grafika · maturita")
    return f'''<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(titul)} | {SITE}</title>
<meta name="description" content="{html.escape(popis)}">
<meta name="theme-color" content="#23272D">
<meta property="og:title" content="{html.escape(titul)}">
<meta property="og:description" content="{html.escape(popis)}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='5' fill='%2323272D'/%3E%3Ctext x='12' y='17' text-anchor='middle' font-family='Arial Black,Arial' font-weight='900' font-size='14' fill='%23F4F0E7'%3EGr%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Barlow+Condensed:wght@600;700;800&family=Caveat:wght@600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel}assets/css/styl.css">
</head>
<body data-page="{soubor}">
{hlavicka(rel, soubor, stitek_b, stitek_s)}
<main id="obsah">
{telo}
</main>
{paticka(rel)}
<script src="{rel}assets/js/app.js"></script>
<script src="{rel}assets/js/interaktivni.js"></script>
</body>
</html>
'''


def pager(c, rel):
    i = PORADI.index(c)
    pred = PORADI[i - 1] if i > 0 else None
    dal = PORADI[i + 1] if i + 1 < len(PORADI) else None
    a = f'<a class="prev" href="{href_lekce(pred, rel)}"><small>← Předchozí lekce</small><b>{pred:02d} · {html.escape(LEKCE[pred][1])}</b></a>' if pred else '<span></span>'
    b = f'<a class="next" href="{href_lekce(dal, rel)}"><small>Další lekce →</small><b>{dal:02d} · {html.escape(LEKCE[dal][1])}</b></a>' if dal else f'<a class="next" href="{rel}kontrola.html"><small>Na závěr →</small><b>Kontrola před odevzdáním</b></a>'
    return f'<div class="wrap"><nav class="pager" aria-label="Další a předchozí lekce">{a}{b}</nav></div>'


def nacti(cesta):
    with open(cesta, encoding="utf-8") as f:
        txt = f.read()
    m = re.match(r"\s*<!--META\s*(\{.*?\})\s*-->\s*", txt, re.S)
    if not m:
        raise ValueError(f"Chybí META v {cesta}")
    meta = json.loads(m.group(1))
    return meta, txt[m.end():]


def hlavicka_lekce(c, meta, rel):
    """Záhlaví lekce: kicker se skupinou, číslo otázky, název, lead, štítky."""
    key, nazev, pism = skupina_lekce(c)
    slug, titul, pod = LEKCE[c]
    stitky = "".join(f'<li><b>{html.escape(b)}</b>{html.escape(t)}</li>' for b, t in meta.get("stitky", []))
    subnav = "".join(f'<a href="#{i}">{html.escape(t)}</a>' for i, t in meta.get("subnav", []))
    return f'''<section class="stage-head stage-{key}">
  <div class="wrap">
    <p class="kicker"><span class="otazka-num">Maturitní otázka {c}</span><span class="blok">· {nazev}</span></p>
    <h1>{meta.get("h1", html.escape(titul))}</h1>
    <p class="lead">{meta["lead"]}</p>
    <ul class="zadani">{stitky}</ul>
    <nav class="subnav" aria-label="Obsah lekce">{subnav}</nav>
  </div>
</section>
'''


def mapa_lekci(rel=""):
    bloky = []
    for key, nazev, pism, cisla in SKUPINY:
        items = "".join(f'<li><a href="{href_lekce(c, rel)}" data-lekce="{c:02d}"><span class="n">{c:02d}</span><span>{html.escape(LEKCE[c][1])}</span></a></li>' for c in cisla)
        bloky.append(f'<div class="blok sk-{key}"><h3>{nazev}</h3><ul>{items}</ul></div>')
    return '<div class="mapa-lekci">' + "".join(bloky) + '</div>'


def cisla_lekci(rel=""):
    return '<div class="cislovane">' + "".join(f'<a href="{href_lekce(c, rel)}" data-lekce="{c:02d}" title="{html.escape(LEKCE[c][1])}">{c}</a>' for c in sorted(LEKCE)) + '</div>'


def tokeny(telo, rel):
    telo = telo.replace("{{MAPA}}", mapa_lekci(rel)).replace("{{CISLA}}", cisla_lekci(rel))
    if "{{LICENCE}}" in telo:
        lp = os.path.join(SRC, "stranky", "_licence.html")
        telo = telo.replace("{{LICENCE}}", open(lp, encoding="utf-8").read() if os.path.exists(lp) else "")
    for k, v in ODKAZY.items():
        telo = telo.replace("{{" + k + "}}", v)
    def lk(m):
        c = int(m.group(1)); return href_lekce(c, rel)
    telo = re.sub(r"\{\{L(\d+)\}\}", lk, telo)
    return telo


def build():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "lekce"))
    shutil.copytree(os.path.join(STATIC, "assets"), os.path.join(OUT, "assets"))
    shutil.copytree(os.path.join(STATIC, "img"), os.path.join(OUT, "img"))

    # průřezové stránky
    for soubor in sorted(os.listdir(os.path.join(SRC, "stranky"))):
        if not soubor.endswith(".html") or soubor.startswith("_"):
            continue
        meta, telo = nacti(os.path.join(SRC, "stranky", soubor))
        telo = tokeny(telo, "")
        with open(os.path.join(OUT, soubor), "w", encoding="utf-8") as f:
            f.write(obal(meta, telo, "", soubor))
        print("stránka", soubor)

    # lekce
    hotove = 0
    for c in sorted(LEKCE):
        slug = LEKCE[c][0]
        zdroj = os.path.join(SRC, "lekce", f"{c:02d}-{slug}.html")
        if not os.path.exists(zdroj):
            print("CHYBÍ lekce", c, slug)
            continue
        meta, telo = nacti(zdroj)
        key, nazev, pism = skupina_lekce(c)
        meta.setdefault("title", f"{c:02d} · {LEKCE[c][1]}")
        meta.setdefault("stitek_b", f"OTÁZKA {c} / 23")
        meta.setdefault("stitek_s", nazev)
        soubor = f"{c:02d}-{slug}.html"
        telo = tokeny(hlavicka_lekce(c, meta, "../") + telo, "../") + pager(c, "../")
        with open(os.path.join(OUT, "lekce", soubor), "w", encoding="utf-8") as f:
            f.write(obal(meta, telo, "../", soubor))
        hotove += 1
    print(f"hotovo: {hotove}/23 lekcí")

    # README, .nojekyll a zdrojové soubory pro budoucí úpravy
    if os.path.exists(os.path.join(STATIC, "README.md")):
        shutil.copy(os.path.join(STATIC, "README.md"), OUT)
    open(os.path.join(OUT, ".nojekyll"), "w").close()
    zdroj = os.path.join(OUT, "_zdroj")
    os.makedirs(os.path.join(zdroj, "src"), exist_ok=True)
    for d in ("lekce", "stranky"):
        shutil.copytree(os.path.join(SRC, d), os.path.join(zdroj, "src", d))
    for f in ("build.py", "gen_dejiny.py"):
        if os.path.exists(os.path.join(ROOT, f)):
            shutil.copy(os.path.join(ROOT, f), zdroj)
    if os.path.isdir(os.path.join(ROOT, "data")):
        shutil.copytree(os.path.join(ROOT, "data"), os.path.join(zdroj, "data"))

    # mapa lekcí pro JS (index, vyhledávání)
    mapa = [{"c": c, "slug": LEKCE[c][0], "t": LEKCE[c][1], "p": LEKCE[c][2], "sk": skupina_lekce(c)[0]} for c in PORADI]
    with open(os.path.join(OUT, "assets", "js", "lekce.js"), "w", encoding="utf-8") as f:
        f.write("window.LEKCE=" + json.dumps(mapa, ensure_ascii=False) + ";\n")


if __name__ == "__main__":
    build()
