$ProgressPreference = 'SilentlyContinue'

$wallpapers = @(
  @{ Name = '01'; Url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '02'; Url = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '03'; Url = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '04'; Url = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '05'; Url = 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '06'; Url = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '07'; Url = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '08'; Url = 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '09'; Url = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '10'; Url = 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '11'; Url = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '12'; Url = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80' }
)

New-Item -ItemType Directory -Force -Path 'wallpapers' | Out-Null

foreach ($w in $wallpapers) {
  $out = Join-Path 'wallpapers' "$($w.Name).jpg"
  if (Test-Path $out) {
    Write-Host "Already exists: $out"
    continue
  }
  try {
    Invoke-WebRequest -Uri $w.Url -OutFile $out -UseBasicParsing -TimeoutSec 60
    Write-Host "Downloaded: $out"
  } catch {
    Write-Host "Failed ($($w.Name)): $($_.Exception.Message)"
  }
}

Write-Host 'Done.'
