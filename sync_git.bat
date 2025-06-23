@echo off
cd /d C:\Users\jared\SaaSLandingPageGenerator
echo Checking current branch...
"C:\Program Files\Git\cmd\git.exe" branch

echo.
echo Fetching latest from remote...
"C:\Program Files\Git\cmd\git.exe" fetch origin

echo.
echo Merging remote changes...
"C:\Program Files\Git\cmd\git.exe" merge origin/main --allow-unrelated-histories

echo.
echo Current status...
"C:\Program Files\Git\cmd\git.exe" status --short

echo.
echo Done!
pause