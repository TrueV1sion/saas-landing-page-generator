@echo off
echo ======================================
echo Pushing to GitHub Repository
echo ======================================
echo.
echo Repository: https://github.com/TrueV1sion/saas-landing-page-generator.git
echo.

cd /d "C:\Users\jared\SaaSLandingPageGenerator"

REM Check if Git is available
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Using Git from Program Files...
    set GIT_CMD="C:\Program Files\Git\cmd\git.exe"
) else (
    set GIT_CMD=git
)

echo Checking current status...
%GIT_CMD% status
echo.

echo Adding all changes...
%GIT_CMD% add .
echo.

echo Creating commit...
%GIT_CMD% commit -m "Update SaaS Landing Page Generator - %date% %time%"
if %errorlevel% neq 0 (
    echo No changes to commit, or commit failed.
    echo.
)

echo Pulling latest changes from remote...
%GIT_CMD% pull origin main --rebase
if %errorlevel% neq 0 (
    echo Pull failed. You may need to resolve conflicts.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub...
%GIT_CMD% push origin main

if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo SUCCESS! Code pushed to GitHub!
    echo ======================================
    echo.
    echo Repository: https://github.com/TrueV1sion/saas-landing-page-generator
    echo.
) else (
    echo.
    echo ======================================
    echo Push failed. Possible issues:
    echo ======================================
    echo 1. Check your GitHub credentials
    echo 2. Make sure you have push access to the repository
    echo 3. Try using a Personal Access Token for authentication
    echo.
)

pause