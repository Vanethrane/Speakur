# Cleanup script: remove ad-related code from all HTML files
# KEEPS: Google Analytics (gtag.js), robots.txt

$root = "C:\Users\tknvrs\Speakur"
$files = Get-ChildItem -Path $root -Filter "*.html" -Recurse
$total = $files.Count
$i = 0

foreach ($f in $files) {
    $i++
    if ($i % 1000 -eq 0) { Write-Host "Processing $i / $total ..." }
    
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $original = $content

    # 1. Remove SPEAKUR_AD_CONFIG inline script block
    $content = [regex]::Replace($content, '(?s)\s*<script>\s*window\.SPEAKUR_AD_CONFIG\s*=.*?</script>\s*', "`n")

    # 2. Remove Ezoic loader IIFE (gatekeeperconsent/ezojs/ezoicanalytics)
    $content = [regex]::Replace($content, '(?s)\s*<script>\s*\(function\s*\(\)\s*\{\s*var cfg = window\.SPEAKUR_AD_CONFIG.*?</script>\s*', "`n")

    # 3. Remove motionless-bus script
    $content = [regex]::Replace($content, '\s*<script[^>]*src="https://motionless-bus\.com[^"]*"[^>]*></script>\s*', "`n")

    # 4. Remove ad slot divs (speakur-ad-top, speakur-ad-bottom, speakur-ad-mid)
    $content = [regex]::Replace($content, '\s*<div id="speakur-ad-(top|bottom|mid)"[^>]*>.*?</div>\s*', "`n")

    # 5. Remove --ad-banner-h and --ad-inline-h CSS variables from inline styles
    $content = [regex]::Replace($content, '\s*--ad-banner-h:\s*[^;]+;\s*', "`n      ")
    $content = [regex]::Replace($content, '\s*--ad-inline-h:\s*[^;]+;\s*', "`n      ")

    # 6. Remove .ad-slot CSS rules from inline <style> blocks
    $content = [regex]::Replace($content, '(?s)\s*\.ad-slot\s*\{[^}]*\}\s*', "`n    ")
    $content = [regex]::Replace($content, '(?s)\s*\.ad-slot-top\s*\{[^}]*\}\s*', "`n    ")
    $content = [regex]::Replace($content, '(?s)\s*\.ad-slot-bottom\s*\{[^}]*\}\s*', "`n    ")

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
    }
}

Write-Host "Done. Processed $total HTML files."
