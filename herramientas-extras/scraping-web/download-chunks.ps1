# filepath: api/scripts/download-chunks.ps1
# Descarga todos los chunks JS de instasorteos.com y busca señales de precios

$ErrorActionPreference = 'SilentlyContinue'
$urls = @(
  'https://instasorteos.com/main-CHOVXZYH.js',
  'https://instasorteos.com/chunk-JLWAB4VX.js',
  'https://instasorteos.com/chunk-3WO3ZORY.js',
  'https://instasorteos.com/chunk-KCVF3EAZ.js',
  'https://instasorteos.com/chunk-ON2PX475.js',
  'https://instasorteos.com/chunk-XUQLGDOZ.js',
  'https://instasorteos.com/chunk-MFP33CQW.js',
  'https://instasorteos.com/chunk-EJJBCPAK.js',
  'https://instasorteos.com/chunk-KGMHJCH4.js',
  'https://instasorteos.com/chunk-724YDDD4.js',
  'https://instasorteos.com/chunk-7RAY7KKY.js',
  'https://instasorteos.com/chunk-R3UVG2EG.js',
  'https://instasorteos.com/chunk-LSQFVEQY.js',
  'https://instasorteos.com/chunk-6NQAJAND.js',
  'https://instasorteos.com/chunk-ERLL2IVU.js',
  'https://instasorteos.com/chunk-SJO7VLSB.js',
  'https://instasorteos.com/chunk-SJ6C6EJR.js',
  'https://instasorteos.com/chunk-7Q55A7OR.js',
  'https://instasorteos.com/chunk-MQ7XLIKY.js',
  'https://instasorteos.com/chunk-XQNEQA6Q.js',
  'https://instasorteos.com/chunk-BATDX7MA.js',
  'https://instasorteos.com/chunk-DFZM7ATN.js',
  'https://instasorteos.com/chunk-FW3OXNJY.js',
  'https://instasorteos.com/chunk-LXT4YMAY.js',
  'https://instasorteos.com/chunk-BYSAFY2V.js',
  'https://instasorteos.com/chunk-WETD5ACK.js',
  'https://instasorteos.com/chunk-66CYG427.js',
  'https://instasorteos.com/chunk-3HKOODZJ.js',
  'https://instasorteos.com/polyfills-FFHMD2TL.js'
)
$outDir = 'Logs/scraping/chunks'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$hits = @()
foreach ($u in $urls) {
  $name = Split-Path $u -Leaf
  $file = Join-Path $outDir $name
  try {
    Invoke-WebRequest -Uri $u -OutFile $file -UseBasicParsing -ErrorAction Stop
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if ($content -match '(?i)(price|plan|suscrip|precio|ARS|costo|gratis|comentario|mil|1000|2000|5000)') {
      $hits += $name
    }
  } catch {
    Write-Host "FAIL: $u"
  }
}

Write-Host '--- CHUNKS CON SENALES DE PRECIOS ---'
$hits | ForEach-Object { Write-Host "  $_" }
Write-Host "--- Total chunks descargados: ---"
(Get-ChildItem $outDir | Measure-Object).Count
