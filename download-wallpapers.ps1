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
  @{ Name = '12'; Url = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '13'; Url = 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '14'; Url = 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '15'; Url = 'https://images.unsplash.com/photo-1431411207774-da3c9611fd95?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '16'; Url = 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '17'; Url = 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '18'; Url = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '19'; Url = 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '20'; Url = 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '21'; Url = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '22'; Url = 'https://images.unsplash.com/photo-1500530855697-b586dba89ee3?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '23'; Url = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80' },
  @{ Name = '24'; Url = 'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=1920&q=80' }
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
