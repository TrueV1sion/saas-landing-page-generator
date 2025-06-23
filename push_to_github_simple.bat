@echo off
cd /d C:\Users\jared\SaaSLandingPageGenerator

echo Setting up git credential helper...
"C:\Program Files\Git\cmd\git.exe" config --global credential.helper manager

echo.
echo Pushing TypeScript fixes to GitHub...
echo NOTE: You will be prompted for GitHub authentication
echo Use your GitHub username and Personal Access Token
echo.

"C:\Program Files\Git\cmd\git.exe" push origin main --force

echo.
echo Push attempt complete!
echo.
echo If successful, Vercel will now build with the fixed TypeScript code.
echo If it failed, create a token at: https://github.com/settings/tokens
pause