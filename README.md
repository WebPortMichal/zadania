# Zadania z informatyki

Strona z zadaniami — Michał Składanowski, klasa 2 K/P.
Każde zadanie to zwykły plik HTML w folderze `zadania/`. Strona pokazuje go
dwa razy: jako kolorowany kod z numeracją linii i jako żywy podgląd w ramce.

## Jak dodać nowe zadanie

1. Wrzuć plik do folderu `zadania/`, np. `zadania/02-tabela.html`.
   Nazwa: numer, myślnik, krótki tytuł, bez polskich znaków i spacji.
2. Dopisz jeden wpis w `spis.json`, na końcu listy `zadania`:

```json
{
  "plik": "02-tabela.html",
  "tytul": "Tabela z ocenami",
  "opis": "Krótko, o co chodziło w zadaniu. Można zostawić puste."
}
```

Pamiętaj o przecinku po poprzednim wpisie. To wszystko — spis po lewej,
kafelki na stronie głównej i nawigacja „poprzednie / następne" zrobią się same.

## Jak to obejrzeć u siebie

Podwójny klik na `index.html` **nie zadziała** — przeglądarka blokuje
wczytywanie plików z dysku. Odpal lokalny serwer w folderze projektu:

```
python -m http.server
```

i wejdź na http://localhost:8000

## Publikacja na GitHub Pages

W repozytorium: **Settings → Pages → Source: Deploy from a branch →
Branch: `main`, folder `/ (root)` → Save**. Po minucie strona jest pod
`https://<login>.github.io/<nazwa-repo>/`.

## Co jest w plikach

| plik | do czego |
|---|---|
| `index.html` | szkielet strony, same puste miejsca |
| `styl.css` | wygląd, kolory w zmiennych na górze pliku |
| `strona.js` | wczytywanie zadań, kolorowanie składni, nawigacja |
| `spis.json` | lista zadań + dane do metryczki (autor, klasa) |
| `zadania/` | właściwe zadania, zwykłe pliki HTML |
