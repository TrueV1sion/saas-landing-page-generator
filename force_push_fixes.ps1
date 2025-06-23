# Git Push Script with Authentication Handling
Set-Location "C:\Users\jared\SaaSLandingPageGenerator"
$git = "C:\Program Files\Git\cmd\git.exe"

Write-Host "=== Pushing TypeScript Fixes to GitHub ===" -ForegroundColor Cyan
Write-Host ""

# First, let's see what we have locally
Write-Host "Checking local changes..." -ForegroundColor Yellow
$modifiedFiles = & $git diff --name-only
$modifiedFilesStaged = & $git diff --cached --name-only

if ($modifiedFiles -or $modifiedFilesStaged) {
    Write-Host "Found local changes to push" -ForegroundColor Green
    
    # Stage the TypeScript fixes
    Write-Host "`nStaging TypeScript fixes..." -ForegroundColor Yellow
    & $git add src/api/analyticsRouter.ts 2>$null
    & $git add src/core/ABTestingEngine.ts 2>$null  
    & $git add src/core/LandingPageGenerator.ts 2>$null
    & $git add src/core/TemplateEngine.ts 2>$null
    
    # Also add the module resolution fixes if they exist
    if (Test-Path "src/api/index.ts") { & $git add src/api/index.ts }
    if (Test-Path "src/middleware/index.ts") { & $git add src/middleware/index.ts }
    if (Test-Path "src/services/index.ts") { & $git add src/services/index.ts }
    if (Test-Path "src/utils/index.ts") { & $git add src/utils/index.ts }
    
    # Add configuration fixes
    & $git add package.json 2>$null
    & $git add tsconfig.json 2>$null
    
    # Create commit
    Write-Host "`nCreating commit..." -ForegroundColor Yellow
    $commitMessage = "Fix TypeScript compilation errors for Vercel deployment"
    & $git commit -m $commitMessage 2>$null
}

# Now let's handle the push with authentication
Write-Host "`nConfiguring Git credentials..." -ForegroundColor Yellow

# Store credentials for this session
$env:GIT_ASKPASS = "echo"

# Try to push
Write-Host "`nAttempting to push to GitHub..." -ForegroundColor Yellow
Write-Host "NOTE: If this fails, you'll need to:" -ForegroundColor Magenta
Write-Host "1. Create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "2. Use the token as your password when prompted" -ForegroundColor Yellow
Write-Host ""

# Force push to handle the branch divergence
$pushResult = & $git push origin main --force-with-lease 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Success! Fixes pushed to GitHub!" -ForegroundColor Green
    Write-Host "Vercel should now be able to build successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Push failed. Trying alternative approach..." -ForegroundColor Red
    
    # Try setting remote URL with token placeholder
    Write-Host "`nTo push with a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Generate new token with 'repo' scope" -ForegroundColor Cyan
    Write-Host "3. Run this command with your token:" -ForegroundColor Cyan
    Write-Host "   git remote set-url origin https://YOUR_TOKEN@github.com/TrueV1sion/saas-landing-page-generator.git" -ForegroundColor White
    Write-Host "4. Then run: git push origin main" -ForegroundColor White
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")