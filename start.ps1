# Script para iniciar los servicios con Docker Compose
Write-Host "Iniciando servicios API y Web con Docker Compose..." -ForegroundColor Green

docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Reintentando con 'docker-compose'..." -ForegroundColor Yellow
    docker-compose up --build -d
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Servicios iniciados correctamente:" -ForegroundColor Green
    Write-Host "  - Web App:  http://localhost:5173" -ForegroundColor Yellow
    Write-Host "  - API:      http://localhost:3001/api/v1" -ForegroundColor Yellow
    Write-Host "  - Swagger:  http://localhost:3001/api/docs" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
} else {
    Write-Host "Error al iniciar los servicios con Docker Compose." -ForegroundColor Red
}
