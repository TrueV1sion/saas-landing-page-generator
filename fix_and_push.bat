@echo off
cd /d C:\Users\jared\SaaSLandingPageGenerator
echo Fixing git repository state...
echo.
echo Aborting rebase...
"C:\Program Files\Git\cmd\git.exe" rebase --abort
echo.
echo Pulling latest changes from GitHub...
"C:\Program Files\Git\cmd\git.exe" pull origin main
echo.
echo Adding TypeScript fixes...
"C:\Program Files\Git\cmd\git.exe" add src/api/analyticsRouter.ts
"C:\Program Files\Git\cmd\git.exe" add src/core/ABTestingEngine.ts
"C:\Program Files\Git\cmd\git.exe" add src/core/LandingPageGenerator.ts
"C:\Program Files\Git\cmd\git.exe" add src/core/TemplateEngine.ts
"C:\Program Files\Git\cmd\git.exe" add src/api/index.ts
"C:\Program Files\Git\cmd\git.exe" add src/middleware/index.ts
"C:\Program Files\Git\cmd\git.exe" add src/services/index.ts
"C:\Program Files\Git\cmd\git.exe" add src/utils/index.ts
"C:\Program Files\Git\cmd\git.exe" add package.json
"C:\Program Files\Git\cmd\git.exe" add tsconfig.json
echo.
echo Committing TypeScript fixes...
"C:\Program Files\Git\cmd\git.exe" commit -m "Fix TypeScript compilation errors

- Fix sessionID error in analyticsRouter.ts
- Add type annotations for array filters in ABTestingEngine.ts
- Fix boolean type in LandingPageGenerator.ts  
- Fix type annotations in TemplateEngine.ts
- Add barrel exports for cleaner imports
- Update tsconfig and package.json for CommonJS"
echo.
echo Pushing to GitHub...
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
echo Done!
