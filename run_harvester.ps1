# AXIOM Dataset Harvester Runner
# Penggunaan:
#   .\run_harvester.ps1                          (Scrape seluruh 6 mode secara PARALEL)
#   .\run_harvester.ps1 -status                  (Cek progres file CSV dan daftar target)
#   .\run_harvester.ps1 -mode x_user             (Scrape khusus X User)
#   .\run_harvester.ps1 -mode ig_reels           (Scrape khusus IG Reels)
#   .\run_harvester.ps1 -sequential              (Scrape berurutan 1 per 1)

param(
    [string]$mode = "all",
    [switch]$status = $false,
    [switch]$all = $false,
    [switch]$sequential = $false
)

if ($status) {
    docker exec axiom_backend python -u /app/tools/dataset_harvester/harvester.py --status
} else {
    $targetMode = if ($all) { "all" } else { $mode }
    $seqParam = if ($sequential) { "--sequential" } else { "" }
    if ($seqParam) {
        docker exec axiom_backend python -u /app/tools/dataset_harvester/harvester.py --mode $targetMode $seqParam
    } else {
        docker exec axiom_backend python -u /app/tools/dataset_harvester/harvester.py --mode $targetMode
    }
}

# Sinkronkan file CSV ke folder data/raw_datasets di root workspace
$srcCsv = "$PSScriptRoot\backend\data\raw_datasets"
$dstCsv = "$PSScriptRoot\data\raw_datasets"
if (Test-Path $srcCsv) {
    Copy-Item "$srcCsv\*" $dstCsv -Recurse -Force -ErrorAction SilentlyContinue
}
