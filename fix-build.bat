@echo off
echo ========================================
echo Fixing TypeScript Build Issues for Vercel
echo ========================================
echo.

cd /d "C:\Users\jared\SaaSLandingPageGenerator"

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Generating Prisma Client...
call npx prisma generate

echo.
echo Step 3: Building TypeScript...
call npx tsc

if %errorlevel% neq 0 (
    echo.
    echo Build failed! Checking for common issues...
    echo.
    echo Common fixes:
    echo 1. Module imports - ensure all relative imports are correct
    echo 2. Type definitions - check for missing type annotations
    echo 3. Prisma client - run 'npx prisma generate'
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Successful!
echo ========================================
echo.
echo Next steps:
echo 1. Commit changes: git commit -am "Fix TypeScript build issues"
echo 2. Push to GitHub: git push origin main
echo 3. Deploy to Vercel: vercel --prod
echo.
pause