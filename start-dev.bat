@echo off
echo Starting workout dev server...
start "" "http://localhost:8080"
python -m http.server 8080
