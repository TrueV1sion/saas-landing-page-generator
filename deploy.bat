@echo off
echo =====================================
echo SaaS Landing Page Generator - GitHub Deploy
echo =====================================
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git not installed! Get it from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Initializing Git...
git init
git add .
git commit -m "Initial commit: Complete SaaS Landing Page Generator"
git branch -M main

set /p username="Enter your GitHub username: "
git remote add origin https://github.com/%username%/saas-landing-page-generator.git

echo.
echo Create repo at: https://github.com/new
echo Name: saas-landing-page-generator
echo Make it PUBLIC, don't initialize with README
echo.
pause

echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your repo: https://github.com/%username%/saas-landing-page-generator
pause