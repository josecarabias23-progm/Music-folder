# Script para detener los servicios de Docker Compose
Write-Host "Deteniendo servicios de Music Folder..." -ForegroundColor Yellow

docker compose down
if ($LASTEXITCODE -ne 0) {
    Write-Host "Reintentando con 'docker-compose'..." -ForegroundColor Yellow
    docker-compose down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Servicios detenidos correctamente." -ForegroundColor Green
} else {
    Write-Host "Error al detener los servicios." -ForegroundColor Red
}
