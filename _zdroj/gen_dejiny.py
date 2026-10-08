#!/usr/bin/env python3
"""Generátor lekcí 17–20 (dějiny umění) z dat webu Časová osa dějin umění (data/epochy.json, data/lic.json).
Výstup: src/lekce/17-dejiny-pravek.html … 20-dejiny-novovek.html. Spouští se před build.py."""
import json, random, html, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
E = {e["id"]: e for e in json.load(open(os.path.join(ROOT, "data/epochy.json"), encoding="utf-8"))}
LIC = json.load(open(os.path.join(ROOT, "data/lic.json"), encoding="utf-8"))

LEKCE = [
    dict(n=17, slug="17-dejiny-pravek", nazev="Dějiny umění – pravěk", obdobi="pravěku", obd2="pravěkých kultur",
         evropa=["paleolit", "mezolit", "neolit", "eneolit", "bronz", "zelezo"], svet=["svet_nejstarsi", "svet_australie"], kompakt=[],
         uvod="Pravěk je nejdelší kapitola dějin umění – od prvních maleb v jeskyních doby ledové (před 40 000 lety) po keltská oppida na prahu letopočtu. Umění vzniká bez písma, bez měst a bez jmen autorů: víme, <b>co</b> lidé vytvořili, ale <b>proč</b> musíme vykládat z nálezů. Periodizace podle materiálu nástrojů: doba kamenná (paleolit, mezolit, neolit, eneolit), bronzová, železná.",
         charakter=["<b>Paleolit</b> – lovci a sběrači, jeskynní malby zvířat (Chauvet, Lascaux, Altamira), venuše (Věstonická – nejstarší keramika světa), rytiny, loveckou magií a rituálem.", "<b>Mezolit</b> – oteplení po době ledové, drobné nástroje (mikrolity), skalní malby s postavami lovců a lučištníků (Valltorta).", "<b>Neolit</b> – zemědělství (neolitická revoluce), stálé osady, dlouhé domy, keramika (lineární, malovaná), megality (Stonehenge, Newgrange), kult plodnosti.", "<b>Eneolit</b> – měď, šňůrová keramika, Ötzi; <b>doba bronzová</b> – metalurgie, Nebeský disk z Nebry, Sluneční vůz z Trundholmu, mohyly, hradiště.", "<b>Doba železná</b> – halštat a latén, Keltové: hlava z Mšeckých Žehrovic, šperk, oppida (Závist, Stradonice), mince; na konci Germáni a Řím."]),
    dict(n=18, slug="18-dejiny-starovek", nazev="Dějiny umění – starověk", obdobi="starověku", obd2="starověkých kultur",
         evropa=["mezopotamie", "egypt", "egejske", "recko", "etruskove", "rim", "krestanska_antika"], svet=["svet_persie", "svet_indie", "svet_cina", "svet_mezoamerika", "svet_andy", "svet_afrika"], kompakt=[],
         uvod="Starověk začíná písmem a městy (Mezopotámie, Egypt kolem 3000 př. n. l.) a končí pádem západořímské říše (476). Umění slouží bohům a vládcům: chrámy, hrobky, sochy panovníků – a v Řecku poprvé člověk jako míra všeho: kánon, kontrapost, řády. Řím přebírá řecké formy a přidává inženýrství (oblouk, klenba, beton). Křesťanská antika přenáší antické formy do nového obsahu.",
         charakter=["<b>Mezopotámie</b> – Sumer, Babylon, Asýrie: zikkurat, klínové písmo, Chammurapiho zákoník, Ištařina brána – glazované cihly, reliéfy králů a lvů.", "<b>Egypt</b> – pyramidy (Džoser, Gíza), chrámy (Karnak, Abú Simbel), kánon postavy z profilu, hieratická velikost, posmrtný kult – Tutanchamon, Nefertiti; 3000 let téměř neměnného stylu.", "<b>Egejské kultury</b> – Kréta (Knóssos, fresky, býk) a Mykény (Lví brána, zlatá maska); <b>Řecko</b> – archaické (kúros), klasické (Parthenón, Polykleitos, Feidias), helénismus (Pergamon, Láokoón); řády dórský, iónský, korintský.", "<b>Etruskové</b> – hrobky s freskami, sarkofágy manželů, terakota; <b>Řím</b> – Koloseum, Pantheon, akvadukty, vítězné oblouky, portrét (verismus), mozaika, Pompeje.", "<b>Křesťanská antika</b> – katakomby, Dobrý pastýř, bazilika, mozaiky Ravenny – symbol místo těla.", "<b>Mimo Evropu</b> – Persie (Persepolis), Indie (Mohendžodaro, stúpa), Čína (terakotová armáda, bronz, tušová malba), Mezoamerika (Olmékové, Mayové), Andy (Nazca, Machu Picchu), Afrika (Ife, Benin)."]),
    dict(n=19, slug="19-dejiny-stredovek", nazev="Dějiny umění – středověk", obdobi="středověku", obd2="středověké Evropy",
         evropa=["byzanc", "rany_stredovek", "romansky", "gotika"], svet=["islam", "svet_japonsko", "asie_jihovychod", "svet_oceanie"], kompakt=[],
         uvod="Evropský středověk (476–1492/1500) je uměním křesťanské víry: stavba chrámu, obraz jako „bible chudých“, anonymní dílny. Byzanc uchovává antické dědictví na Východě (ikona, mozaika, kupole), raný středověk na Západě (stěhování národů, Karel Veliký, iluminace) připravuje <b>románský sloh</b> (masivní zeď, půlkruhový oblouk) a <b>gotiku</b> (lomený oblouk, žebrová klenba, opěrný systém, vitráž – světlo jako Bůh). U nás: Velká Morava, Přemyslovci (rotundy, Znojmo), Karel IV. (sv. Vít, Karlštejn, Parléř), krásný sloh, Jagellonci (Ried).",
         charakter=["<b>Byzanc</b> (330–1453) – Hagia Sofia, mozaiky Ravenny (San Vitale), ikona (Vladimirská), Pantokrator; plochost, zlato, inverzní perspektiva, hieratičnost.", "<b>Raný středověk</b> (476–1000) – stěhování národů, zlatnictví (gombíky Velké Moravy), iluminované rukopisy (Book of Kells), karolinská renesance (Cáchy), plán kláštera Sankt Gallen.", "<b>Románský sloh</b> (1000–1250) – masivní zdi, malá okna, půlkruhový oblouk, valená a křížová klenba, bazilika, rotunda; portál s tympanonem (Autun), nástěnné malby (Znojmo), Třebíč.", "<b>Gotika</b> (1140–1500) – katedrála (Saint-Denis, Chartres, Notre-Dame, Sainte-Chapelle), vertikalita, vitráže, krásné madony, deskový obraz (Vyšebrodský oltář, Theodorik), van Eyck – olejomalba; Karel IV., Parléř, Karlštejn.", "<b>Mimo Evropu</b> – islámské umění (Córdoba, Alhambra – ornament, arabeska, kaligrafie, zákaz zobrazování), Japonsko (Rjóanži, dřevořez), Angkor a Borobudur, Oceánie (moai)."]),
    dict(n=20, slug="20-dejiny-novovek", nazev="Dějiny umění – novověk včetně moderní doby", obdobi="novověku včetně moderní doby", obd2="novověké Evropy",
         evropa=["renesance", "baroko", "rokoko", "klasicismus", "romantismus", "historismus", "realismus", "impresionismus", "postimpresionismus", "secese"],
         svet=[], kompakt=["fauvismus", "expresionismus", "kubismus", "futurismus", "abstrakce", "dada", "konstruktivismus", "parizska_skola", "surrealismus", "abstraktni_expresionismus", "popart", "kineticke", "performance", "land_art", "postmoderna", "stoleti21"],
         uvod="Novověk začíná <b>renesancí</b> – znovuobjevením antiky, člověka a perspektivy (Brunelleschi, Leonardo, Michelangelo, Dürer) – a vede přes dramatické <b>baroko</b>, hravé <b>rokoko</b>, rozumový <b>klasicismus</b>, citový <b>romantismus</b> a <b>realismus</b> k <b>impresionismu</b>, který maluje světlo. Odtud se v 20. století umění rozpadá na „ismy“: od secese přes fauvismus, expresionismus, kubismus a abstrakci po surrealismus, pop art, akční umění a současnou instalaci a digitální tvorbu. Vedle Evropy sleduj i Čechy: Rudolf II., barokní Praha a Kuks, Národní divadlo, Mucha, Kupka, kubismus, Toyen, Medek, Sýkora, Kintera.",
         charakter=["<b>Renesance</b> (1400–1600) – Florencie, perspektiva, kánon, olejomalba; Masaccio, Botticelli, Leonardo, Raffael, Michelangelo, Tizian; na severu van Eyck, Dürer, Bosch, Bruegel; u nás Belveder, Litomyšl, Rudolf II. (Arcimboldo).", "<b>Baroko</b> (1600–1750) – pohyb, světlo a stín (šerosvit), iluze, emoce; Caravaggio, Bernini, Rubens, Rembrandt, Vermeer; u nás Dientzenhoferové (sv. Mikuláš), Braun (Kuks), Brandl, Škréta. <b>Rokoko</b> – lehkost, pastel, Fragonard, Watteau.", "<b>Klasicismus a empír</b> (1760–1830) – návrat k antice, rozum, David, Canova, Pantheon v Paříži; <b>romantismus</b> – cit, příroda, minulost: Friedrich, Turner, Delacroix, Mánes; <b>historismus</b> – neoslohy, Národní divadlo.", "<b>Realismus</b> (1840–1880) – všední skutečnost, Courbet, Millet, Mařák; <b>impresionismus</b> (1870–1890) – dojem, světlo, plenér, Monet, Manet, Renoir, Degas; <b>postimpresionismus</b> – Cézanne, van Gogh, Gauguin, Seurat.", "<b>Secese</b> (1890–1914) – ornament, křivka, užité umění: Mucha, Klimt, Gaudí, Obecní dům.", "<b>Moderna 20. století</b> – fauvismus (Matisse), expresionismus (Munch, Kirchner, Kubišta), kubismus (Picasso, Braque, Filla, Gočár), futurismus, abstrakce (Kandinskij, Kupka, Malevič, Mondrian), dada (Duchamp), konstruktivismus a Bauhaus, surrealismus (Dalí, Magritte, Toyen), abstraktní expresionismus (Pollock, Rothko), informel (Medek), pop art (Warhol), op art (Vasarely, Sýkora), happening a performance (Beuys, Kovanda), land art (Christo), postmoderna, 21. století (Kusama, Eliasson, Banksy, Ai Weiwei, Beeple – NFT)."]),
]

GLOBAL_LINKS = {"vs": "{{vs}}", "dejiny": "{{dejiny}}"}


def esc(s):
    return html.escape(str(s), quote=False)


def licence_text(img):
    l = LIC.get(img)
    if not l:
        return "Wikimedia Commons"
    a = l.get("autor", "")
    lc = l.get("licence", "")
    if lc.lower().startswith("public"):
        return f"{esc(a)} · volné dílo" if a else "volné dílo"
    return f"foto: {esc(a)} · {esc(lc)}".strip(" ·")


def figura(p, eid):
    img = p.get("img")
    if not img:
        return ""
    src = "../img/dejiny/" + os.path.splitext(img)[0] + ".webp"
    return (f'<figure data-ep="{eid}"><img src="{src}" alt="{esc(p["nazev"])}" loading="lazy" data-zoom>'
            f'<figcaption><b>{esc(p["nazev"])}</b>{esc(p.get("popis", ""))}<small>{licence_text(img)}</small></figcaption></figure>')


def seznam(xs):
    return "".join(f"<li>{esc(x)}</li>" for x in xs)


def epocha_full(e, svet=False):
    faze = " ".join(f'<span class="chip">{esc(f["nazev"])} <em>{esc(f["kdy"])}</em></span>' for f in e.get("faze", []))
    obl = e.get("oblasti", {})
    NAZVY = {"architektura": "Architektura", "socharstvi": "Sochařství", "malirstvi": "Malířství", "uzite": "Užité umění", "uzite_umeni": "Užité umění"}
    obl_html = "".join(f"<li><b>{esc(NAZVY.get(k, k.capitalize()))}</b>: {esc(v)}</li>" for k, v in obl.items())
    texty = "".join(f"<p>{esc(t)}</p>" for t in e.get("text", [])[:3])
    klima = e.get("klima")
    if isinstance(klima, dict):
        klima = klima.get("text", "")
    dila = "".join(figura(p, e["id"]) for p in e.get("pamatky", []))
    kick = "Mimo Evropu" if svet else "Epocha"
    return f'''
<section class="section epocha" id="e-{e["id"]}">
  <div class="wrap">
    <div class="section-head">
      <div><span class="kicker">{kick}</span><h2>{esc(e["nazev"])}</h2><p class="podtitul">{esc(e.get("podtitul", ""))} · <b>{esc(e["datace"])}</b></p></div>
      <p>{esc(e.get("strucne", ""))}</p>
    </div>
    <div class="faze-chips">{faze}</div>
    <div class="cols-2">
      <div class="card"><h3>Charakteristika</h3>{texty}</div>
      <div>
        <div class="card"><h3>Hlavní znaky</h3><ul>{seznam(e.get("znaky", []))}</ul></div>
        <div class="card" style="margin-top:14px"><h3>Architektura · sochařství · malířství</h3><ul>{obl_html}</ul></div>
        <div class="card" style="margin-top:14px"><h3>Osobnosti a Česko</h3><p><b>Jména:</b> {esc(", ".join(e.get("osobnosti", [])))}</p><p><b>U nás:</b> {esc(e.get("cesko", ""))}</p>{f"<p><b>Souvislosti:</b> {esc(klima)}</p>" if klima else ""}</div>
      </div>
    </div>
    <h3 class="dila-h">Památky k prezentaci <small>klikni pro zvětšení · popisky = vzor pro tvoje slidy</small></h3>
    <div class="dila">{dila}</div>
    <p class="note">Podrobněji na webu <a href="{{{{dejiny}}}}#{e["id"]}" target="_blank" rel="noopener">Časová osa dějin umění – {esc(e["nazev"])}</a>.</p>
  </div>
</section>'''


def epocha_kompakt(e):
    dila = "".join(figura(p, e["id"]) for p in e.get("pamatky", [])[:3])
    return f'''
    <div class="card epocha-k" id="e-{e["id"]}">
      <h3>{esc(e["nazev"])} <small>{esc(e["datace"])}</small></h3>
      <p class="podtitul">{esc(e.get("podtitul", ""))}</p>
      <p>{esc(e.get("strucne", ""))}</p>
      <ul>{seznam(e.get("znaky", [])[:4])}</ul>
      <p><b>Jména:</b> {esc(", ".join(e.get("osobnosti", [])[:6]))}<br><b>U nás:</b> {esc(e.get("cesko", ""))}</p>
      <div class="dila mini">{dila}</div>
      <p class="note"><a href="{{{{dejiny}}}}#{e["id"]}" target="_blank" rel="noopener">Víc na časové ose</a></p>
    </div>'''


def osa(ids):
    out = []
    for i in ids:
        e = E[i]
        out.append(f'<a class="osa-ep" href="#e-{i}"><b>{esc(e["nazev"])}</b><span>{esc(e["datace"])}</span></a>')
    return '<div class="osa-epochy">' + "".join(out) + "</div>"


def kviz(L, rnd):
    ids = L["evropa"] + L["svet"] + L["kompakt"]
    hlavni = L["evropa"] + L["kompakt"]
    qs = []
    # 1) památka → epocha
    kand = [(p, i) for i in hlavni for p in E[i].get("pamatky", []) if p.get("img")]
    rnd.shuffle(kand)
    for p, i in kand[:4]:
        others = [j for j in hlavni if j != i]
        rnd.shuffle(others)
        opts = [i] + others[:3]
        rnd.shuffle(opts)
        qs.append({"q": f"Do kterého období patří „{p['nazev']}“?", "o": [E[j]["nazev"] for j in opts], "a": opts.index(i), "w": f"{p['nazev']}: {p.get('popis', '')} ({E[i]['datace']})."})
    # 2) epocha → datace
    dat = list(hlavni)
    rnd.shuffle(dat)
    for i in dat[:2]:
        others = [j for j in hlavni if j != i]
        rnd.shuffle(others)
        opts = [i] + others[:3]
        rnd.shuffle(opts)
        qs.append({"q": f"Období „{E[i]['nazev']}“ datujeme přibližně", "o": [E[j]["datace"] for j in opts], "a": opts.index(i), "w": E[i]["strucne"]})
    # 3) znak → epocha
    zn = list(hlavni)
    rnd.shuffle(zn)
    for i in zn[:3]:
        if not E[i].get("znaky"):
            continue
        z = rnd.choice(E[i]["znaky"])
        others = [j for j in hlavni if j != i]
        rnd.shuffle(others)
        opts = [i] + others[:3]
        rnd.shuffle(opts)
        qs.append({"q": f"„{z}“ je typické pro", "o": [E[j]["nazev"] for j in opts], "a": opts.index(i), "w": f"{E[i]['nazev']} ({E[i]['datace']}): {E[i]['strucne']}"})
    return json.dumps(qs, ensure_ascii=False, indent=6).replace("'", "&#39;")


def komise(L):
    out = []
    out.append(f'<li><details><summary>Charakterizuj {L["obd2"]} jako celek.</summary><div class="odp">{L["uvod"]}</div></details></li>')
    for i in L["evropa"]:
        e = E[i]
        out.append(f'<li><details><summary>Jaké jsou hlavní znaky období {esc(e["nazev"])}?</summary><div class="odp">{esc(e["datace"])}. {esc(e["strucne"])} Znaky: {esc("; ".join(e.get("znaky", [])))}. Jména: {esc(", ".join(e.get("osobnosti", [])[:6]))}. U nás: {esc(e.get("cesko", ""))}</div></details></li>')
    out.append('<li><details><summary>Proč jsi vybral právě tyto památky a co o každé řekneš?</summary><div class="odp">Ke každému obrázku: <b>název, datace, místo/sbírka, materiál a technika, sloh/fáze, autor</b> (pokud je znám) a jednu souvislost – k čemu dílo sloužilo, co bylo nového, co z něj převzaly další epochy. Vybírej tak, aby každá fáze období měla aspoň jednu architekturu, jednu sochu/plastiku a jednu malbu či užité umění.</div></details></li>')
    out.append('<li><details><summary>Odkud jsou obrázky a smíš je použít?</summary><div class="odp">Z Wikimedia Commons – volná díla (autor zemřel před více než 70 lety) nebo fotografie pod licencí CC BY / CC BY-SA, u kterých uvádím autora fotografie a licenci v popisku nebo na posledním slidu „Zdroje“. Pro školní prezentaci platí i citační výjimka, ale zdroj uvádím vždy.</div></details></li>')
    out.append('<li><details><summary>V jakém programu jsi prezentaci dělal a proč PDF?</summary><div class="odp">InDesign (vzorové stránky, styly, obrázky umístěné jako vazby, export do interaktivního PDF 16 : 9) nebo Illustrator/PowerPoint. PDF se otevře všude stejně, drží písma i obrázky, spustí se na celou obrazovku (Ctrl+L) a listuje se šipkami.</div></details></li>')
    return "".join(out)


def lekce_html(L):
    rnd = random.Random(L["n"] * 7919)
    n = L["n"]
    ev = L["evropa"]
    sv = L["svet"]
    ko = L["kompakt"]
    all_ids = ev + sv + ko
    subnav = [[f"l{n}-otazka", "Co se losuje"], [f"l{n}-prehled", "Přehled období"], [f"l{n}-prezentace", "Jak na prezentaci"]]
    subnav += [[f"e-{i}", E[i]["nazev"]] for i in ev]
    if ko:
        subnav.append([f"l{n}-moderna", "Moderna 20. a 21. století"])
    if sv:
        subnav.append([f"l{n}-svet", "Mimo Evropu"])
    subnav += [[f"l{n}-poznavacka", "Poznávačka"], [f"l{n}-postup", "Postup pro 30 minut"], [f"l{n}-chyby", "Časté chyby"], [f"l{n}-komise", "Otázky komise"], [f"l{n}-kviz", "Kvíz"]]
    pocet_del = sum(len([p for p in E[i].get("pamatky", []) if p.get("img")]) for i in all_ids)
    meta = {
        "title": f"{n} · {L['nazev']}",
        "description": f"Maturitní otázka {n}: obrazová prezentace památek {L['obdobi']} s popisky (název, datace, souvislosti) uložená do PDF; charakteristika {L['obd2']} a jednotlivých památek.",
        "lead": f"Sestavíš <b>obrazovou prezentaci</b> vybraných památek {L['obdobi']} – každý obrázek s <b>popiskem</b> (název, přibližná datace, místo, technika, sloh, autor) – a uložíš ji do <b>PDF</b>. U obhajoby ji spustíš, nejdřív <b>charakterizuješ období</b> jako celek a pak mluvíš ke každému obrázku: co to je, kdy, proč je to důležité a jaké má kulturní a výtvarné souvislosti. Tahle lekce má {len(ev) + len(ko)} epoch, {pocet_del} památek s popisky k převzetí a poznávačku.",
        "stitky": [["Editor", "InDesign / Illustrator / PowerPoint – 16 : 9"], ["Výstup", "PDF prezentace s popisky"], ["Teorie", f"charakteristika {L['obd2']} + památky"], ["Obrázky", "Wikimedia Commons – volná díla a CC"]],
        "subnav": subnav,
    }
    charakter = "".join(f"<li>{c}</li>" for c in L["charakter"])
    moderna = ""
    if ko:
        moderna = f'''
<section class="section" id="l{n}-moderna">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Moderní doba</span><h2>Moderna 20. a 21. století – „ismy“ v kostce</h2></div><p>Zadání říká „novověk včetně moderní doby“. Nemusíš umět všechny směry do hloubky, ale musíš je umět zařadit, pojmenovat jejich princip a jedno dílo. Každá karta = jeden slide.</p></div>
    <div class="cols-3 kompakt">{"".join(epocha_kompakt(E[i]) for i in ko)}</div>
  </div>
</section>'''
    svet = ""
    if sv:
        svet = f'''
<section class="section" id="l{n}-svet">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Souvislosti</span><h2>Mimo Evropu ve stejné době</h2></div><p>Komise ocení jednu až dvě ukázky, že svět nebyla jen Evropa – a datace, která to zařadí vedle evropských epoch.</p></div>
    <div class="cols-3 kompakt">{"".join(epocha_kompakt(E[i]) for i in sv)}</div>
  </div>
</section>'''
    poz = "".join(figura(p, i) for i in all_ids for p in E[i].get("pamatky", []) if p.get("img"))
    return f'''<!--META {json.dumps(meta, ensure_ascii=False)} -->
<section class="section" id="l{n}-otazka">
  <div class="wrap">
    <div class="otazka">
      <div class="ot-prak">
        <h3><span class="badge">Praktická část</span> Co se obvykle chce</h3>
        <ul>
          <li>Ve zvoleném grafickém editoru <b>jednoduchá obrazová prezentace</b> obrázků dokumentujících vybrané památky {L["obdobi"]}.</li>
          <li>Ke každému obrázku <b>popisek</b>: název, <b>přibližná datace</b> a další související údaje (místo, materiál/technika, sloh, autor).</li>
          <li>Prezentaci uložit do <b>PDF</b>.</li>
        </ul>
        <div class="cas"><span>30 min u počítače</span><span>15 min obhajoba</span><span>podklady: obrázky k období (nebo vlastní z Commons)</span></div>
      </div>
      <div>
        <h3><span class="badge light">Teoretická část</span> Co musíš umět vysvětlit</h3>
        <ul>
          <li>Spustit prezentaci a nejdřív <b>charakterizovat {L["obd2"]}</b> jako celek (časové vymezení, společnost, funkce umění, materiály, hlavní fáze).</li>
          <li>Pak ke <b>každému obrázku</b>: charakteristika konkrétní památky + <b>kulturní a výtvarně-dějinné souvislosti</b> (co předcházelo, co následovalo, k čemu sloužilo, čím je typické).</li>
        </ul>
        <p class="note">Celý přehled všech období s mapou, osou a vyhledáváním: <a href="{{{{dejiny}}}}" target="_blank" rel="noopener">Časová osa dějin umění</a>. Výtvarná teorie (perspektiva, kánon): <a href="{{{{L16}}}}">lekce 16</a>.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="l{n}-prehled">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Charakteristika období</span><h2>{esc(L["nazev"].replace("Dějiny umění – ", "").capitalize())} v kostce</h2></div><p>{L["uvod"]}</p></div>
    {osa(ev + ko)}
    <div class="card" style="margin-top:18px"><h3>Co říct na úvod obhajoby (2 minuty)</h3><ul class="kroky">{charakter}</ul></div>
  </div>
</section>

<section class="section" id="l{n}-prezentace">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Praktická část</span><h2>Jak sestavit prezentaci s popisky</h2></div><p>Stejný postup pro všechny čtyři otázky z dějin umění. Rozhoduje výběr památek, správné popisky a čistý jednotný layout – ne efekty.</p></div>
    <div class="cols">
      <div class="card"><h3>Dokument</h3><ul><li><b>InDesign</b>: Nový › Web, 1920 × 1080 px (16 : 9), RGB; vzorová stránka s názvem období v hlavičce, číslem stránky a místem pro popisek; <b>objektový styl</b> pro rámeček obrázku (přizpůsobit proporčně, zarovnat na střed).</li><li>Odstavcové styly: <b>Titulek</b> (Barlow Condensed 56 px), <b>Popisek</b> (24 px), <b>Datace</b> (tučně, barevně), <b>Zdroj</b> (14 px, šedě).</li><li>Alternativa: Illustrator s plátny 1920 × 1080, nebo PowerPoint 16 : 9 – ale ukaž, že umíš layout (mřížka, zarovnání, kontrast).</li><li>Obrázky: Umístit (Ctrl+D) jako vazby, nikdy neroztahovat nepoměrně; u svislých obrazů dva vedle sebe.</li></ul></div>
      <div class="card"><h3>Popisek – vzor</h3><p class="popisek-vzor"><b>Katedrála v Chartres</b><br>1194–1220, vrcholná gotika, Francie<br>kámen, žebrová klenba, 176 vitráží<br><small>foto: Wikimedia Commons, CC BY-SA</small></p><ul><li>Řádek 1: <b>název</b> (česky, případně originál).</li><li>Řádek 2: <b>datace</b> (rok / rozmezí / „kolem“ / století), <b>sloh a fáze</b>, místo nebo sbírka.</li><li>Řádek 3: materiál, technika, rozměry, autor.</li><li>Řádek 4: <b>zdroj a licence</b> obrázku.</li><li>Popisky v této lekci jsou psané přesně v tomto duchu – můžeš je převzít.</li></ul></div>
      <div class="card"><h3>Struktura 10–14 slidů</h3><ol class="kroky"><li>Titul: období, datace, jméno, třída.</li><li>Časová osa / mapa období s fázemi (jeden slide).</li><li>8–12 památek: každá vlastní slide s velkým obrázkem a popiskem – architektura, sochařství, malířství, užité umění; postupuj chronologicky.</li><li>Jeden slide „u nás“ (české památky období).</li><li>Zdroje obrázků.</li><li>Export: Soubor › Exportovat › <b>Adobe PDF (interaktivní)</b>, stránky, Zobrazit po exportu; zkontroluj velikost (obrázky stačí 150 ppi) a spusť Ctrl+L.</li></ol></div>
    </div>
  </div>
</section>
{"".join(epocha_full(E[i]) for i in ev)}
{moderna}
{svet}

<section class="section" id="l{n}-poznavacka">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Procvič</span><h2>Poznávačka</h2></div><p>Skryj popisky, zamíchej a říkej si ke každému obrázku: název, datace, období, souvislost. Najetím myší popisek odhalíš.</p></div>
    <div data-poznavacka>
      <div class="poznavacka-ctrl"><button class="btn btn-small btn-primary" type="button" data-skryt>Skrýt popisky (poznávačka)</button><button class="btn btn-small btn-ghost" type="button" data-michat>Zamíchat</button><span class="hint">{pocet_del} památek</span></div>
      <div class="dila">{poz}</div>
    </div>
  </div>
</section>

<section class="section" id="l{n}-postup">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Praktická část</span><h2>Postup pro 30 minut</h2></div><p>Většinu času sežere hledání obrázků a psaní popisků – proto měj v hlavě 8–10 památek, které umíš, a jejich datace.</p></div>
    <div class="cols-2">
      <ul class="plan30">
        <li><span class="t">0–3<small>min</small></span><div><b>Výběr</b><p>Projdi připravené obrázky, vyber 8–12 památek napříč fázemi období a druhy umění. Seřaď chronologicky.</p></div></li>
        <li><span class="t">3–8<small>min</small></span><div><b>Šablona</b><p>InDesign 1920 × 1080, vzorová stránka (hlavička, číslo), styly Titulek/Popisek/Datace/Zdroj, objektový styl rámečku. Titulní slide.</p></div></li>
        <li><span class="t">8–11<small>min</small></span><div><b>Osa období</b><p>Slide s fázemi a daty (obdélníky + text) – ukáže, že období chápeš v čase.</p></div></li>
        <li><span class="t">11–24<small>min</small></span><div><b>Památky</b><p>Na každý slide: umístit obrázek, přizpůsobit rámečku, popisek 3–4 řádky podle vzoru. Cca 1 minuta na slide – popisky piš stručně, mluvit budeš u obhajoby.</p></div></li>
        <li><span class="t">24–27<small>min</small></span><div><b>U nás + zdroje</b><p>Slide s českými památkami období; poslední slide zdroje obrázků (soubor, autor, licence).</p></div></li>
        <li><span class="t">27–30<small>min</small></span><div><b>Kontrola a export</b><p>Pravopis (Ctrl+I), datace a názvy, žádný roztažený obrázek, jednotné velikosti písma. Export interaktivní PDF, otevřít, Ctrl+L, projít.</p></div></li>
      </ul>
      <div>
        <div class="card">
          <h3>Co říct komisi na začátek</h3>
          <p>„Prezentaci jsem sestavil v InDesignu jako PDF 16 : 9 s jednotnou šablonou a popisky název – datace – místo – technika – zdroj. Období {L["obdobi"]} charakterizuji takto: …“ (viz Přehled období výše – 5 vět). „Památky jsem vybral tak, aby pokryly fáze období a architekturu, sochařství i malířství, včetně českých příkladů.“</p>
        </div>
        <div class="timer" data-timer style="margin-top:16px"></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="l{n}-chyby">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Ze zpětné vazby</span><h2>Časté chyby</h2></div></div>
    <div class="cols">
      <div class="tip chyba"><b>Chyba</b>Popisek jen s názvem – chybí datace a souvislosti, které zadání výslovně chce.</div>
      <div class="tip chyba"><b>Chyba</b>Obrázky roztažené nepoměrně, malé, rozmazané nebo s vodoznakem; bez uvedení zdroje.</div>
      <div class="tip chyba"><b>Chyba</b>Prezentace 4 : 3 nebo A4 na výšku, každý slide jiný layout a písmo; text v odstavcích místo popisků.</div>
      <div class="tip chyba"><b>Chyba</b>Památky zaměněné mezi obdobími (Pantheon římský × pařížský, Theodorik v renesanci, Stonehenge v paleolitu).</div>
      <div class="tip chyba"><b>Chyba</b>Obhajoba bez úvodní charakteristiky – žák hned čte popisky; komise se ptá „a co je pro to období typické?“.</div>
      <div class="tip chyba"><b>Chyba</b>Chybí české památky a vazba na dnešek (co z období vidíš v Pardubicích, v Praze).</div>
    </div>
  </div>
</section>

<section class="section" id="l{n}-komise">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Obhajoba</span><h2>Na co se komise ptá</h2></div></div>
    <ul class="komise">{komise(L)}</ul>
  </div>
</section>

<section class="section" id="l{n}-kviz">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Ověř si</span><h2>Kvíz</h2></div></div>
    <div class="quiz" id="kviz{n}" data-quiz='{kviz(L, rnd)}'></div>
  </div>
</section>

<section class="section" id="l{n}-odkazy">
  <div class="wrap">
    <div class="section-head"><div><span class="kicker">Dál</span><h2>Odkazy</h2></div></div>
    <div class="odkazy-lekce">
      <a class="link-card" href="{{{{dejiny}}}}#osa" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="12" r="2"/></svg><div><b>Časová osa dějin umění</b><span>Interaktivní osa všech epoch s detaily a obrázky.</span></div></a>
      <a class="link-card" href="{{{{dejiny}}}}#prehled" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg><div><b>Přehledová tabulka slohů</b><span>Znaky, architektura, sochařství, malířství vedle sebe.</span></div></a>
      <a class="link-card" href="{{{{dejiny}}}}#mapa" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg><div><b>Mapa světa a umění mimo Evropu</b><span>Kde se co dělo ve stejné době.</span></div></a>
      <a class="link-card" href="https://commons.wikimedia.org/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg><div><b>Wikimedia Commons</b><span>Volné obrázky děl – vždy zkontroluj licenci a uveď autora.</span></div></a>
      <a class="link-card" href="{{{{L16}}}}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20L12 4l9 16z"/></svg><div><b>Lekce 16: výtvarná teorie</b><span>Perspektiva, kánon, zlatý řez – pojmy, které se k památkám hodí.</span></div></a>
      <a class="link-card" href="../zdroje.html#obrazky"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg><div><b>Zdroje obrázků tohoto webu</b><span>Licence použitých ukázek.</span></div></a>
    </div>
  </div>
</section>
'''


def main():
    for L in LEKCE:
        path = os.path.join(ROOT, "src/lekce", L["slug"] + ".html")
        open(path, "w", encoding="utf-8").write(lekce_html(L))
        print("zapsáno", path)
    # seznam licencí pro zdroje.html
    rows = []
    for e in E.values():
        for p in e.get("pamatky", []):
            img = p.get("img")
            if not img:
                continue
            l = LIC.get(img, {})
            rows.append((p["nazev"], l.get("zdroj", ""), l.get("autor", ""), l.get("licence", ""), l.get("url", "")))
    rows.sort(key=lambda r: r[0].lower())
    out = ["<table class=\"sazba licence\"><thead><tr><th>Dílo</th><th>Soubor na Commons</th><th>Autor</th><th>Licence</th></tr></thead><tbody>"]
    for n, z, a, lc, u in rows:
        zz = f'<a href="{esc(u)}" target="_blank" rel="noopener">{esc(z.replace("File:", ""))}</a>' if u else "Wikimedia Commons (viz seznam na webu dějin umění)"
        out.append(f"<tr><td>{esc(n)}</td><td>{zz}</td><td>{esc(a)}</td><td>{esc(lc)}</td></tr>")
    out.append("</tbody></table>")
    open(os.path.join(ROOT, "src/stranky/_licence.html"), "w", encoding="utf-8").write("".join(out))
    print("licence:", len(rows))


if __name__ == "__main__":
    main()
