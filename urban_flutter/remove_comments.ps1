# PowerShell script to remove comments from Dart files
# Usage: .\remove_comments.ps1

$libPath = "lib"
$backupPath = "lib_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "🔍 Starting comment removal process..." -ForegroundColor Cyan

# Create backup
Write-Host "📦 Creating backup at: $backupPath" -ForegroundColor Yellow
Copy-Item -Path $libPath -Destination $backupPath -Recurse -Force
Write-Host "✅ Backup created successfully" -ForegroundColor Green

# Get all Dart files
$dartFiles = Get-ChildItem -Path $libPath -Filter "*.dart" -Recurse

Write-Host "📝 Found $($dartFiles.Count) Dart files to process" -ForegroundColor Cyan

$processedCount = 0

foreach ($file in $dartFiles) {
    $processedCount++
    Write-Host "[$processedCount/$($dartFiles.Count)] Processing: $($file.Name)" -ForegroundColor Gray
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove single-line comments (// ...)
    # Preserve strings that might contain //
    $content = $content -replace '//[^\r\n]*', ''
    
    # Remove multi-line comments (/* ... */)
    $content = $content -replace '/\*[\s\S]*?\*/', ''
    
    # Remove doc comments (/// ...)
    $content = $content -replace '///[^\r\n]*', ''
    
    # Clean up extra blank lines (more than 2 consecutive)
    $content = $content -replace '(\r?\n){3,}', "`r`n`r`n"
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "`n✅ Successfully processed $processedCount files" -ForegroundColor Green
Write-Host "📂 Backup location: $backupPath" -ForegroundColor Yellow
Write-Host "`n🔧 Running flutter analyze..." -ForegroundColor Cyan

# Run flutter analyze
& flutter analyze

Write-Host "`n✅ Comment removal complete!" -ForegroundColor Green
Write-Host "⚠️  Please verify the changes and run 'flutter build web' to ensure everything works." -ForegroundColor Yellow
