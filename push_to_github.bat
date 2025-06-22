@echo off
cd /d "C:\Users\jared\SaaSLandingPageGenerator"
echo Checking git status...
"C:\Program Files\Git\cmd\git.exe" status
echo.
echo Adding all files...
"C:\Program Files\Git\cmd\git.exe" add .
echo.
echo Creating commit...
"C:\Program Files\Git\cmd\git.exe" commit -m "Update SaaS Landing Page Generator"
echo.
echo Pushing to GitHub...
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
echo Done!
pause