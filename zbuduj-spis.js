/* Przeglada folder zadania/ i sklada z niego spis.json.
   Tytul kazdego zadania bierze z <title> w pliku, opis z komentarza
   <!-- opis: ... --> (jesli jest). Kolejnosc - po nazwie pliku,
   dlatego warto zaczynac nazwe od numeru: 01-, 02-, 03-...

   Nic tu nie trzeba uruchamiac recznie: podglad.cmd robi to sam przy
   kazdym odswiezeniu strony, a wyslij.cmd przed wyslaniem na GitHuba. */

const fs = require("fs");
const path = require("path");

const KATALOG = __dirname;
const FOLDER_ZADAN = path.join(KATALOG, "zadania");

function tytulZPliku(tresc, nazwa) {
  const m = tresc.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m && m[1].trim()) return m[1].trim();
  // brak <title> - robimy tytul z nazwy pliku: "02-tabela-ocen" -> "Tabela ocen"
  const goly = nazwa.replace(/\.[^.]+$/, "").replace(/^\d+[-_]?/, "").replace(/[-_]+/g, " ").trim();
  return goly ? goly.charAt(0).toUpperCase() + goly.slice(1) : nazwa;
}

function opisZPliku(tresc) {
  const m = tresc.match(/<!--\s*opis:\s*([\s\S]*?)-->/i);
  return m ? m[1].trim().replace(/\s+/g, " ") : "";
}

function zbuduj() {
  const dane = JSON.parse(fs.readFileSync(path.join(KATALOG, "dane.json"), "utf8"));

  const pliki = fs.existsSync(FOLDER_ZADAN)
    ? fs.readdirSync(FOLDER_ZADAN).filter(function (n) { return /\.html?$/i.test(n); })
    : [];

  // sortowanie "po ludzku": 2 przed 10, wielkosc liter bez znaczenia
  pliki.sort(function (a, b) {
    return a.localeCompare(b, "pl", { numeric: true, sensitivity: "base" });
  });

  const opisy = dane.opisy || {};

  dane.zadania = pliki.map(function (nazwa) {
    const tresc = fs.readFileSync(path.join(FOLDER_ZADAN, nazwa), "utf8");
    // opis: najpierw komentarz w pliku, jak go nie ma - wpis z dane.json
    return {
      plik: nazwa,
      tytul: tytulZPliku(tresc, nazwa),
      opis: opisZPliku(tresc) || opisy[nazwa] || ""
    };
  });

  delete dane.opisy;
  return dane;
}

// uruchomione wprost (node zbuduj-spis.js) - zapisz plik na dysk
if (require.main === module) {
  const dane = zbuduj();
  fs.writeFileSync(path.join(KATALOG, "spis.json"), JSON.stringify(dane, null, 2) + "\n", "utf8");
  console.log("spis.json zbudowany - zadan: " + dane.zadania.length);
  dane.zadania.forEach(function (z, i) {
    console.log("  " + (i + 1) + ". " + z.tytul + "  (" + z.plik + ")");
  });
}

module.exports = zbuduj;
