@echo off
rem Wysyla zmiany na strone. Dwuklik i tyle.
chcp 65001 >nul
cd /d "%~dp0"
title Wysylanie na strone

echo.
echo  Skladam spis zadan...
node zbuduj-spis.js
if errorlevel 1 goto blad

echo.
echo  Wysylam na GitHuba...
git add -A
git diff --cached --quiet && (echo  Nic sie nie zmienilo - nie ma czego wysylac. & goto koniec)

for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set DZIS=%%a-%%b-%%c
git -c user.name="Michal Skladanowski" -c user.email="mariuszskladanowski@gmail.com" commit -q -m "Aktualizacja zadan %DZIS%"
if errorlevel 1 goto blad

git push -q
if errorlevel 1 goto blad

echo.
echo  ================================================================
echo   Wyslane. Za okolo minute zmiana bedzie widoczna pod adresem:
echo   https://webportmichal.github.io/zadania/
echo  ================================================================
goto koniec

:blad
echo.
echo  Cos poszlo nie tak - przeczytaj komunikat powyzej.

:koniec
echo.
pause
