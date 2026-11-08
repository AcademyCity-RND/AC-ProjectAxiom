# AXIOM Dataset Harvester Runner
# Penggunaan:
#   .\run_harvester.ps1 -status                  (Cek progres file CSV dan daftar target)
#   .\run_harvester.ps1 -mode x_user             (Scrape khusus X User)
#   .\run_harvester.ps1 -mode ig_reels           (Scrape khusus IG Reels)
#   .\run_harvester.ps1 -all                     (Scrape seluruh target di targets.json)

param(
    [string]$mode = "all",
    [switch]$status = $false,
    [switch]$all = $false
)

$toolsTargets = "$PSScriptRoot\tools\dataset_harvester\targets.json"
$backendTargets = "$PSScriptRoot\backend\tools\dataset_harvester\targets.json"

# Selaraskan targets.json dan harvester.py jika diedit di salah satu lokasi
if (Test-Path $toolsTargets) {
    Copy-Item $toolsTargets $backendTargets -Force -ErrorAction SilentlyContinue
}
$toolsHarvester = "$PSScriptRoot\tools\dataset_harvester\harvester.py"
$backendHarvester = "$PSScriptRoot\backend\tools\dataset_harvester\harvester.py"
if (Test-Path $toolsHarvester) {
    Copy-Item $toolsHarvester $backendHarvester -Force -ErrorAction SilentlyContinue
}

if ($status) {
    docker exec axiom_backend python -u /app/tools/dataset_harvester/harvester.py --status
} else {
    $targetMode = if ($all) { "all" } else { $mode }
    docker exec axiom_backend python -u /app/tools/dataset_harvester/harvester.py --mode $targetMode
}

# Sinkronkan file CSV ke folder data/raw_datasets di root workspace
$srcCsv = "$PSScriptRoot\backend\data\raw_datasets"
$dstCsv = "$PSScriptRoot\data\raw_datasets"
if (Test-Path $srcCsv) {
    Copy-Item "$srcCsv\*" $dstCsv -Recurse -Force -ErrorAction SilentlyContinue
}
