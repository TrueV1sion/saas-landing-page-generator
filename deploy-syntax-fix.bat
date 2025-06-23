@echo off
echo ===================================
echo CRITICAL FIX: AIService.ts Syntax Error
echo ===================================
echo.
cd /d "C:\Users\jared\SaaSLandingPageGenerator"

echo Staging fix...
"C:\Program Files\Git\cmd\git.exe" add -A

echo.
echo Committing syntax fix...
"C:\Program Files\Git\cmd\git.exe" commit -m "CRITICAL: Fix AIService.ts syntax error - line 108 missing newline causing 100+ TS errors"

echo.
echo Pushing to GitHub (Vercel will auto-deploy)...
"C:\Program Files\Git\cmd\git.exe" push origin main --force-with-lease

echo.
echo ===================================
echo FIX DEPLOYED! Check Vercel dashboard.
echo ===================================
pause