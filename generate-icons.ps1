Add-Type -AssemblyName System.Drawing

function New-Icon {
  param([int]$Size, [string]$Path)

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)),
    [System.Drawing.Color]::FromArgb(255, 79, 70, 229),
    [System.Drawing.Color]::FromArgb(255, 6, 182, 212),
    45.0)

  $d = $Size
  $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $bgPath.AddArc(0, 0, $d, $d, 180, 90)
  $bgPath.AddArc($Size - $d, 0, $d, $d, 270, 90)
  $bgPath.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
  $bgPath.AddArc(0, $Size - $d, $d, $d, 90, 90)
  $bgPath.CloseFigure()
  $g.FillPath($brush, $bgPath)

  $pad = $Size * 0.16
  $nw = $Size - (2 * $pad)
  $nd = $Size * 0.12
  $notePath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $notePath.AddArc($pad, $pad, $nd, $nd, 180, 90)
  $notePath.AddArc($Size - $pad - $nd, $pad, $nd, $nd, 270, 90)
  $notePath.AddArc($Size - $pad - $nd, $Size - $pad - $nd, $nd, $nd, 0, 90)
  $notePath.AddArc($pad, $Size - $pad - $nd, $nd, $nd, 90, 90)
  $notePath.CloseFigure()
  $g.FillPath([System.Drawing.Brushes]::White, $notePath)

  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 100, 100, 130), [math]::Max(1.0, $Size * 0.05))
  $pen.StartCap = 'Round'
  $pen.EndCap = 'Round'
  $x0 = $pad + $nw * 0.16
  $x1 = $pad + $nw * 0.84
  $g.DrawLine($pen, $x0, $pad + $nw * 0.30, $x1, $pad + $nw * 0.30)
  $g.DrawLine($pen, $x0, $pad + $nw * 0.50, $x1, $pad + $nw * 0.50)
  $g.DrawLine($pen, $x0, $pad + $nw * 0.70, $x0 + $nw * 0.35, $pad + $nw * 0.70)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $pen.Dispose()
  $notePath.Dispose()
  $bgPath.Dispose()
  $brush.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

New-Item -ItemType Directory -Force -Path 'icons' | Out-Null
New-Icon -Size 16 -Path 'icons/icon16.png'
New-Icon -Size 48 -Path 'icons/icon48.png'
New-Icon -Size 128 -Path 'icons/icon128.png'
Write-Host 'Icons generated in icons/'
