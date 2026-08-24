# Regenerates videos/playlist.json from the files actually in videos/.
# Run this after adding or removing reels, then reload the extension.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dir = Join-Path $root 'videos'
$exts = @('.mp4', '.m4v', '.webm', '.mov', '.mkv', '.ogv', '.ogg')

$files = Get-ChildItem -Path $dir -File |
  Where-Object { $exts -contains $_.Extension.ToLower() } |
  Sort-Object { [regex]::Replace($_.Name, '\d+', { param($m) $m.Value.PadLeft(10) }) } |
  Select-Object -ExpandProperty Name

$json = $files | ConvertTo-Json
if ($files.Count -eq 1) { $json = "[$json]" }
Set-Content -Path (Join-Path $dir 'playlist.json') -Value "$json`n" -Encoding UTF8

Write-Host "Listed $($files.Count) videos in videos/playlist.json"
