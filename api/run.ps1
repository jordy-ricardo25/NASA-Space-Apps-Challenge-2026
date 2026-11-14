$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path .venv)) { python -m venv .venv }
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt --quiet
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
pytest -q
python -m scripts.ingest
python -m scripts.smoke
Write-Host "`nArranca con: uvicorn app.main:app --reload"
