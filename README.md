# Grafika 4.G – příprava k maturitě

Výukový web pro žáky 4. ročníku oboru Grafika (SPŠE Pardubice): 23 lekcí = 23 maturitních otázek z profilové zkoušky Grafika, průřezové stránky (kontrolní seznam, cvičení, videa, zdroje).

Statický web – stačí nahrát na GitHub Pages (větev `main`, kořen repozitáře). Vstupní stránka je `index.html`.

## Struktura

- `index.html` – rozcestník s mapou lekcí a stavem (navštíveno / kvíz splněn – ukládá se v prohlížeči žáka)
- `kontrola.html` – kontrolní seznam nejčastějších chyb + laboratoře
- `cviceni.html`, `videa.html`, `zdroje.html` – cvičení z Teams, videotutoriály (OneDrive + YouTube), zdroje, skripty, licence obrázků
- `lekce/01-…23-*.html` – lekce (teorie, interaktivní ukázky, postup pro 30 minut, časté chyby, otázky komise, kvíz)
- `assets/css/styl.css`, `assets/js/app.js` (navigace, kvízy, časovač, lightbox, poznávačka), `assets/js/interaktivni.js` (interaktivní laboratoře), `assets/js/lekce.js` (seznam lekcí, generuje se)
- `img/navody/` – screenshoty z výukových PDF, `img/dejiny/` – obrazové ukázky děl (Wikimedia Commons, seznam licencí ve `zdroje.html`)

## Úpravy obsahu

Zdrojové soubory jsou ve složce `_zdroj/`:

- `_zdroj/src/lekce/*.html` – text lekcí (hlavička v komentáři `<!--META {...} -->`, pak sekce)
- `_zdroj/src/stranky/*.html` – průřezové stránky
- `_zdroj/build.py` – generátor: `python build.py` sestaví web do `_zdroj/out/grafika-4g-maturita/` (společné záhlaví, menu, stránkování, odkazy `{{onedrive}}`, `{{L07}}` apod.); obsah této složky pak zkopíruj do kořene repozitáře
- `_zdroj/gen_dejiny.py` + `_zdroj/data/` – generátor lekcí 17–20 z dat webu Časová osa dějin umění (spustit před `build.py`)
- Odkazy na OneDrive, YouTube ID a externí weby jsou v `build.py` (`ODKAZY`) a ve `videa.html`.

Python 3 bez dalších knihoven.
