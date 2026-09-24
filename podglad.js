/* Maly serwer do ogladania strony u siebie przed wrzuceniem na GitHuba.
   Uruchom dwuklikiem na podglad.cmd albo komenda:  node podglad.js
   Potem wejdz na http://localhost:8765 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const KATALOG = __dirname;
const PORT = 8765;

const TYPY = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

const zbudujSpis = require("./zbuduj-spis");

http.createServer(function (req, res) {
  let adres = decodeURIComponent(req.url.split("?")[0]);
  if (adres === "/") adres = "/index.html";

  // Spis zadan skladamy na biezaco z zawartosci folderu zadania/.
  // Dzieki temu wystarczy wrzucic nowy plik i odswiezyc strone.
  if (adres === "/spis.json") {
    try {
      const dane = zbudujSpis();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(JSON.stringify(dane));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Blad przy budowaniu spisu: " + e.message);
    }
    return;
  }

  // zadne wyjscie poza katalog projektu
  const plik = path.join(KATALOG, path.normalize(adres).replace(/^(\.\.[/\\])+/, ""));
  if (!plik.startsWith(KATALOG)) {
    res.writeHead(403);
    res.end("403");
    return;
  }

  fs.readFile(plik, function (e, dane) {
    if (e) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Nie ma takiego pliku: " + adres);
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPY[path.extname(plik).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(dane);
  });
}).listen(PORT, function () {
  console.log("Strona dziala pod adresem: http://localhost:" + PORT);
  console.log("Zamknij to okno, zeby wylaczyc serwer.");
});
