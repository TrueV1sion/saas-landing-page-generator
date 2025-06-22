# SaaS Landing Page Generator - GitHub Deployment Script
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "SaaS Landing Page Generator Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    git --version | Out-Null
    Write-Host "✓ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Initialize repository
Write-Host "`nInitializing Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial commit: Complete SaaS Landing Page Generator with AI, A/B testing, analytics"
git branch -M main

# Get GitHub username
$username = Read-Host "`nEnter your GitHub username"
$repoUrl = "https://github.com/$username/saas-landing-page-generator.git"

# Add remote
git remote add origin $repoUrl

# Instructions
Write-Host "`n======================================" -ForegroundColor Yellow
Write-Host "BEFORE CONTINUING:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: saas-landing-page-generator" -ForegroundColor White
Write-Host "3. Keep it PUBLIC" -ForegroundColor White
Write-Host "4. DON'T initialize with README" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Yellow
Read-Host "`nPress Enter when ready"

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ SUCCESS! Your project is live!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/$username/saas-landing-page-generator" -ForegroundColor Cyan
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Star your repository ⭐" -ForegroundColor White
    Write-Host "2. Add topics: saas, landing-page, ai, typescript" -ForegroundColor White
    Write-Host "3. Enable GitHub Pages for demos" -ForegroundColor White
} else {
    Write-Host "`n✗ Push failed" -ForegroundColor Red
    Write-Host "Try: git push --set-upstream origin main" -ForegroundColor Yellow
}

Read-Host "`nPress Enter to exit"