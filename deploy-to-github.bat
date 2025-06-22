@echo off
echo ======================================
echo SaaS Landing Page Generator Deployment
echo ======================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please download and install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo Git is installed. Proceeding with deployment...
echo.

REM Initialize Git repository
echo Initializing Git repository...
git init

REM Configure Git (optional)
git config core.autocrlf true

REM Add all files
echo Adding all files to Git...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: Complete SaaS Landing Page Generator with AI-powered generation, A/B testing, analytics, and deployment automation"

REM Set main branch
git branch -M main

REM Get GitHub username
set /p username="Enter your GitHub username: "

REM Add remote origin
echo.
echo Adding GitHub remote...
git remote add origin https://github.com/%username%/saas-landing-page-generator.git

echo.
echo ======================================
echo IMPORTANT: Before continuing...
echo ======================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Create a new repository named: saas-landing-page-generator
echo 3. Make it PUBLIC
echo 4. DO NOT initialize with README, .gitignore, or license
echo 5. Click "Create repository"
echo.
echo ======================================
echo.
pause

REM Push to GitHub
echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo SUCCESS! Your project is now on GitHub!
    echo ======================================
    echo.
    echo Repository URL: https://github.com/%username%/saas-landing-page-generator
    echo.
    echo Next steps:
    echo 1. Star your repository
    echo 2. Add topics: saas, landing-page, ai, typescript, nodejs
    echo 3. Enable GitHub Pages in Settings
    echo 4. Add secrets for API keys
    echo.
) else (
    echo.
    echo ======================================
    echo Push failed. Common solutions:
    echo ======================================
    echo.
    echo 1. Make sure you created the repository on GitHub
    echo 2. If asked for credentials, use your GitHub username
    echo 3. For password, use a Personal Access Token (not your password)
    echo    Create one at: https://github.com/settings/tokens
    echo 4. Try running: git push --set-upstream origin main
    echo.
)

pause