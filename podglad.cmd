@echo off
rem Podglad strony u siebie. Dwuklik na ten plik, potem wejdz na http://localhost:8765
cd /d "%~dp0"
start "" http://localhost:8765
node podglad.js
pause
