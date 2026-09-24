# Zadania z informatyki

Strona z zadaniami — Michał Składanowski, klasa 2 K/P.
Na żywo: **https://webportmichal.github.io/zadania/**

Każde zadanie to zwykły plik HTML w folderze `zadania/`. Strona pokazuje go
dwa razy: jako kolorowany kod z numeracją linii i jako żywy podgląd w ramce.

## Jak dodać nowe zadanie

1. Zapisz zadanie jako plik HTML w folderze `zadania/`, np. `02-tabela.html`.
   Nazwa: numer, myślnik, krótki tytuł, bez polskich znaków i spacji.
2. Odśwież stronę. **To wszystko.**

Spis po lewej, kafelek na stronie głównej, numeracja i strzałki
„poprzednie / następne" biorą się same z zawartości folderu.

**Tytuł zadania** strona bierze ze znacznika `<title>` w pliku:

```html
<title>Tabela z ocenami</title>
```

**Opis** (ten szary tekst pod tytułem) jest nieobowiązkowy. Jeśli chcesz go dodać,
wpisz w pliku zadania komentarz:

```html
<!-- opis: Tabela z obramowaniem, trzy kolumny. -->
```

**Kolejność** ustala się po nazwie pliku, dlatego warto zaczynać ją od numeru:
`01-`, `02-`, `03-`…

## Jak to obejrzeć u siebie

Kliknij dwa razy na **`podglad.cmd`** — otworzy stronę na http://localhost:8765
Dopisujesz zadanie → odświeżasz stronę (F5) → widzisz zmianę od razu.

(Podwójny klik na `index.html` **nie zadziała** — przeglądarka blokuje
wczytywanie plików z dysku. Musi iść przez `podglad.cmd`.)

## Jak wrzucić zmiany na stronę w internecie

Kliknij dwa razy na **`wyslij.cmd`**. Po około minucie zmiana jest widoczna
pod https://webportmichal.github.io/zadania/

## Co jest w plikach

| plik | do czego |
|---|---|
| `zadania/` | właściwe zadania, zwykłe pliki HTML — tu pracujesz |
| `podglad.cmd` | podgląd strony u siebie (wymaga Node.js) |
| `wyslij.cmd` | wysłanie zmian na stronę w internecie |
| `dane.json` | autor, klasa, nazwa przedmiotu |
| `index.html` | szkielet strony |
| `styl.css` | wygląd, kolory w zmiennych na górze pliku |
| `strona.js` | wczytywanie zadań, kolorowanie składni, nawigacja |
| `zbuduj-spis.js` | składa `spis.json` z zawartości folderu `zadania/` |
| `spis.json` | wynik powyższego — **nie edytuj ręcznie**, i tak się nadpisze |
