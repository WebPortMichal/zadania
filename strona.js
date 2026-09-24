/* ==========================================================================
   Zadania z informatyki - logika strony.

   Jak to dziala:
   1. wczytuje spis.json (lista zadan),
   2. buduje spis po lewej i kafelki na stronie glownej,
   3. po wybraniu zadania pobiera plik z folderu zadania/ i pokazuje
      go dwa razy: jako kolorowany kod z numeracja linii i jako zywy
      podglad w ramce.

   Dodanie nowego zadania to wrzucenie pliku do zadania/ i dopisanie
   jednego wpisu w spis.json. Tego pliku ruszac nie trzeba.
   ========================================================================== */

(function () {
  "use strict";

  var DANE = null;          // zawartosc spis.json
  var AUTOR = "";
  var KLASA = "";
  var pamiec = {};          // raz pobrany plik zadania zostaje w pamieci

  var elSpis = document.getElementById("spisLista");
  var elKarty = document.getElementById("karty");
  var elStart = document.getElementById("start");
  var elZadanie = document.getElementById("zadanie");
  var elNawigacja = document.getElementById("nawigacja");

  /* ---------- drobiazgi ---------- */

  function escapuj(t) {
    return String(t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function nr(i) {
    return (i + 1) < 10 ? "0" + (i + 1) : String(i + 1);
  }

  function slug(plik) {
    return plik.replace(/\.[^.]+$/, "");
  }

  function el(tag, klasa, tekst) {
    var e = document.createElement(tag);
    if (klasa) e.className = klasa;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  }

  /* ---------- kolorowanie skladni HTML ----------
     Maly, wlasny kolorator: leci linia po linii, wiec numeracja
     zawsze sie zgadza. Stan pamieta tylko to, czy jestesmy w srodku
     komentarza rozciagnietego na kilka linii. */

  function kolorujTag(tag) {
    // tag to np. <p align="right"> albo </font>
    var m = tag.match(/^(<\/?)([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*?)(\/?>)?$/);
    if (!m) return '<span class="t-kw">' + escapuj(tag) + "</span>";

    var out = '<span class="t-kw">' + escapuj(m[1] + m[2]) + "</span>";
    var srodek = m[3] || "";
    var koniec = m[4] || "";

    // atrybuty: nazwa = "wartosc"
    out += srodek.replace(
      /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s>]+)?|([\s\S])/g,
      function (calosc, nazwa, rowna, wartosc, inne) {
        if (nazwa === undefined) return escapuj(inne === undefined ? calosc : inne);
        var s = '<span class="t-fn">' + escapuj(nazwa) + "</span>";
        if (rowna) s += escapuj(rowna);
        if (wartosc) s += '<span class="t-str">' + escapuj(wartosc) + "</span>";
        return s;
      }
    );

    if (koniec) out += '<span class="t-kw">' + escapuj(koniec) + "</span>";
    return out;
  }

  function kolorujLinie(linia, stan) {
    var out = "";
    var i = 0;

    // dokonczenie komentarza z poprzedniej linii
    if (stan.komentarz) {
      var k = linia.indexOf("-->");
      if (k === -1) return '<span class="t-com">' + escapuj(linia) + "</span>";
      out += '<span class="t-com">' + escapuj(linia.slice(0, k + 3)) + "</span>";
      stan.komentarz = false;
      i = k + 3;
    }

    while (i < linia.length) {
      var otw = linia.indexOf("<", i);
      if (otw === -1) { out += escapuj(linia.slice(i)); break; }

      out += escapuj(linia.slice(i, otw));
      var reszta = linia.slice(otw);

      if (reszta.indexOf("<!--") === 0) {
        var kon = reszta.indexOf("-->");
        if (kon === -1) {
          out += '<span class="t-com">' + escapuj(reszta) + "</span>";
          stan.komentarz = true;
          break;
        }
        out += '<span class="t-com">' + escapuj(reszta.slice(0, kon + 3)) + "</span>";
        i = otw + kon + 3;
        continue;
      }

      var zam = reszta.indexOf(">");
      var tag = zam === -1 ? reszta : reszta.slice(0, zam + 1);

      if (reszta.charAt(1) === "!") {
        // <!DOCTYPE ...> - traktujemy jak komentarz, tak jak w oryginale
        out += '<span class="t-com">' + escapuj(tag) + "</span>";
      } else {
        out += kolorujTag(tag);
      }

      if (zam === -1) break;
      i = otw + zam + 1;
    }

    return out;
  }

  function koloruj(zrodlo) {
    var stan = { komentarz: false };
    return zrodlo.replace(/\r\n/g, "\n").split("\n").map(function (linia, n) {
      return '<span class="linia" data-nr="' + (n + 1) + '">' +
             kolorujLinie(linia, stan) + "</span>";
    }).join("");
  }

  /* ---------- klocki strony ---------- */

  function pasekKodu(nazwaPliku) {
    var pasek = el("div", "kod-pasek");
    pasek.appendChild(el("span", "kod-plik", nazwaPliku));
    // Podpis autora dokleja sie sam, zeby zaden blok nie trafil
    // na strone bez oznaczenia.
    pasek.appendChild(el("span", "kod-znak", AUTOR + " · " + KLASA));
    return pasek;
  }

  function blokKodu(nazwaPliku, zrodlo) {
    var blok = el("div", "kod-blok");
    blok.appendChild(pasekKodu(nazwaPliku));
    var pre = document.createElement("pre");
    var code = document.createElement("code");
    code.innerHTML = koloruj(zrodlo);
    pre.appendChild(code);
    blok.appendChild(pre);
    return blok;
  }

  function blokWyniku(zrodlo) {
    var blok = el("div", "kod-blok");
    var pasek = el("div", "kod-pasek");
    pasek.appendChild(el("span", "kod-plik", "wynik"));
    blok.appendChild(pasek);

    // sandbox="" blokuje skrypty w srodku - to ma byc podglad, nie aplikacja.
    var ramka = document.createElement("iframe");
    ramka.className = "ramka";
    ramka.title = "Wynik działania kodu";
    ramka.setAttribute("sandbox", "");
    ramka.srcdoc = zrodlo;
    blok.appendChild(ramka);
    return blok;
  }

  function blokBledu(plik, blad) {
    var d = el("div", "puste");
    d.appendChild(el("p", null, "Nie udało się wczytać pliku zadania/" + plik + "."));
    d.appendChild(el("p", null,
      "Jeśli otwierasz stronę podwójnym klikiem z dysku, przeglądarka blokuje " +
      "wczytywanie plików. Wrzuć repozytorium na GitHub Pages albo uruchom " +
      "lokalny serwer: python -m http.server"));
    if (blad) d.appendChild(el("p", null, "Szczegóły: " + blad));
    return d;
  }

  /* ---------- widoki ---------- */

  function budujSpis() {
    elSpis.innerHTML = "";

    var li = document.createElement("li");
    var a = el("a", "spis-link");
    a.href = "#";
    a.appendChild(el("span", "spis-nr", "—"));
    a.appendChild(el("span", null, "Strona główna"));
    li.appendChild(a);
    elSpis.appendChild(li);

    DANE.zadania.forEach(function (z, i) {
      var li = document.createElement("li");
      var a = el("a", "spis-link");
      a.href = "#" + slug(z.plik);
      a.appendChild(el("span", "spis-nr", nr(i)));
      a.appendChild(el("span", null, z.tytul));
      li.appendChild(a);
      elSpis.appendChild(li);
    });
  }

  function budujKarty() {
    elKarty.innerHTML = "";
    DANE.zadania.forEach(function (z, i) {
      var a = el("a", "karta");
      a.href = "#" + slug(z.plik);
      a.appendChild(el("div", "karta-nr", "ZADANIE " + nr(i)));
      a.appendChild(el("div", "karta-tytul", z.tytul));
      if (z.opis) a.appendChild(el("p", "karta-opis", z.opis));
      elKarty.appendChild(a);
    });
  }

  function budujNawigacje(indeks) {
    elNawigacja.innerHTML = "";

    function link(i, wstecz) {
      var s = document.createElement("span");
      if (i >= -1 && i < DANE.zadania.length) {
        var a = el("a", "naw-link");
        if (i === -1) {
          a.href = "#";
          a.textContent = "← Strona główna";
        } else {
          a.href = "#" + slug(DANE.zadania[i].plik);
          a.textContent = wstecz
            ? "← Zadanie " + nr(i) + " — " + DANE.zadania[i].tytul
            : "Zadanie " + nr(i) + " — " + DANE.zadania[i].tytul + " →";
        }
        s.appendChild(a);
      }
      return s;
    }

    elNawigacja.appendChild(link(indeks - 1, true));
    elNawigacja.appendChild(link(indeks + 1, false));
  }

  function pobierzZadanie(plik) {
    if (pamiec[plik]) return Promise.resolve(pamiec[plik]);
    return fetch("zadania/" + plik, { cache: "no-cache" }).then(function (o) {
      if (!o.ok) throw new Error("HTTP " + o.status);
      return o.text();
    }).then(function (t) {
      pamiec[plik] = t;
      return t;
    });
  }

  function pokazZadanie(indeks) {
    var z = DANE.zadania[indeks];

    elStart.hidden = true;
    elZadanie.hidden = false;
    elZadanie.innerHTML = "";

    elZadanie.appendChild(el("p", "eyebrow", "Zadanie " + nr(indeks)));
    elZadanie.appendChild(el("h1", null, z.tytul));
    if (z.opis) elZadanie.appendChild(el("p", "wstep", z.opis));

    var miejsce = el("div");
    elZadanie.appendChild(miejsce);
    budujNawigacje(indeks);

    pobierzZadanie(z.plik).then(function (zrodlo) {
      miejsce.appendChild(blokKodu(z.plik, zrodlo));
      miejsce.appendChild(blokWyniku(zrodlo));
    }).catch(function (e) {
      miejsce.appendChild(blokBledu(z.plik, e.message));
    });
  }

  function pokazStart() {
    elStart.hidden = false;
    elZadanie.hidden = true;
    elZadanie.innerHTML = "";
    budujNawigacje(-1);
  }

  function pokaz(hash) {
    var indeks = -1;
    DANE.zadania.forEach(function (z, i) {
      if (slug(z.plik) === hash) indeks = i;
    });

    if (indeks === -1) pokazStart();
    else pokazZadanie(indeks);

    // podswietlenie biezacej pozycji w spisie
    Array.prototype.forEach.call(elSpis.querySelectorAll(".spis-link"), function (a) {
      var cel = a.getAttribute("href").slice(1);
      if (cel === hash || (indeks === -1 && cel === "")) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    window.scrollTo(0, 0);
  }

  /* ---------- metryczka i prawa autorskie ---------- */

  function budujMetryczke() {
    document.getElementById("przedmiot").textContent = DANE.przedmiot || "Informatyka — zadania";
    document.getElementById("autor").textContent = AUTOR;
    document.getElementById("klasa").textContent = KLASA;

    var d = new Date();
    document.getElementById("rok").textContent = "rok szkolny " +
      (d.getMonth() >= 8
        ? d.getFullYear() + "/" + (d.getFullYear() + 1)
        : (d.getFullYear() - 1) + "/" + d.getFullYear());

    var p = document.getElementById("prawa");
    p.textContent = "Praca własna — ";
    var mocno = el("strong", null, AUTOR + ", " + KLASA);
    p.appendChild(mocno);
    if (DANE.zalozona) p.appendChild(document.createTextNode(". Strona założona " + DANE.zalozona + "."));
    else p.appendChild(document.createTextNode("."));
  }

  /* ---------- ochrona kodu ---------- */

  function wlaczOchroneKodu() {
    // Menu podreczne nad kodem prowadzi wprost do "Kopiuj" - wylaczamy je
    // TYLKO nad blokami kodu, zeby reszta strony dzialala normalnie.
    // To warstwa tarcia, nie zabezpieczenie: kod jest w plikach repozytorium.
    document.addEventListener("contextmenu", function (e) {
      if (e.target.closest && e.target.closest(".kod-blok")) e.preventDefault();
    });

    // Kopiowanie zaznaczenia z bloku kodu dokleja informacje o autorstwie,
    // wiec wklejony gdzie indziej kod niesie ze soba swoje pochodzenie.
    document.addEventListener("copy", function (e) {
      var zazn = document.getSelection();
      if (!zazn || zazn.isCollapsed) return;
      var w = zazn.anchorNode;
      var wezel = w && (w.nodeType === 1 ? w : w.parentElement);
      if (!wezel || !wezel.closest(".kod-blok")) return;

      e.preventDefault();
      var stopka = "\n\n/* Kod: " + AUTOR + ", " + KLASA + ". Zrodlo: " + location.href + " */";
      e.clipboardData.setData("text/plain", zazn.toString() + stopka);
    });
  }

  /* ---------- start ---------- */

  window.addEventListener("hashchange", function () {
    if (DANE) pokaz(location.hash.slice(1));
  });

  fetch("spis.json", { cache: "no-cache" })
    .then(function (o) {
      if (!o.ok) throw new Error("HTTP " + o.status);
      return o.json();
    })
    .then(function (dane) {
      DANE = dane;
      DANE.zadania = DANE.zadania || [];
      AUTOR = DANE.autor || "";
      KLASA = DANE.klasa || "";

      budujMetryczke();
      budujSpis();
      budujKarty();
      wlaczOchroneKodu();
      pokaz(location.hash.slice(1));
    })
    .catch(function (e) {
      document.getElementById("karty").appendChild(blokBledu("../spis.json", e.message));
    });
})();
