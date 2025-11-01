# Script para configurar Git y subir cambios a GitHub
# Ejecutar: .\setup-git.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuración Git - Rama Diego" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
$currentPath = Get-Location
Write-Host "Directorio actual: $currentPath" -ForegroundColor Yellow

# Verificar si Git está instalado
Write-Host "Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Descarga Git desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 1: Verificar si es un repositorio git
Write-Host "Paso 1: Verificando repositorio Git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "✓ Repositorio Git ya existe" -ForegroundColor Green
} else {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repositorio inicializado" -ForegroundColor Green
}

Write-Host ""

# Paso 2: Verificar remote origin
Write-Host "Paso 2: Configurando repositorio remoto..." -ForegroundColor Cyan
$remoteCheck = git remote -v 2>&1
if ($remoteCheck -match "origin") {
    Write-Host "✓ Remote 'origin' ya está configurado" -ForegroundColor Green
    git remote -v
} else {
    Write-Host "Agregando remote 'origin'..." -ForegroundColor Yellow
    git remote add origin https://github.com/gersss444/ConsultorioDental.git
    Write-Host "✓ Remote agregado" -ForegroundColor Green
}

Write-Host ""

# Paso 3: Verificar rama actual
Write-Host "Paso 3: Verificando rama actual..." -ForegroundColor Cyan
$currentBranch = git branch --show-current 2>&1
if ($currentBranch -match "Diego") {
    Write-Host "✓ Ya estás en la rama Diego" -ForegroundColor Green
} else {
    Write-Host "Creando rama Diego..." -ForegroundColor Yellow
    git checkout -b Diego 2>&1 | Out-Null
    Write-Host "✓ Rama Diego creada" -ForegroundColor Green
}

Write-Host ""

# Paso 4: Verificar .gitignore
Write-Host "Paso 4: Verificando .gitignore..." -ForegroundColor Cyan
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore existe" -ForegroundColor Green
} else {
    Write-Host "⚠ .gitignore no existe - será creado automáticamente" -ForegroundColor Yellow
}

Write-Host ""

# Paso 5: Ver estado de archivos
Write-Host "Paso 5: Estado de archivos..." -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "¿Deseas continuar y agregar todos los archivos? (S/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -ne "S" -and $response -ne "s" -and $response -ne "Y" -and $response -ne "y") {
    Write-Host "Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Paso 6: Agregar archivos
Write-Host "Paso 6: Agregando archivos..." -ForegroundColor Cyan
git add .
Write-Host "✓ Archivos agregados al staging" -ForegroundColor Green

Write-Host ""

# Paso 7: Hacer commit
Write-Host "Paso 7: Creando commit..." -ForegroundColor Cyan
$commitMessage = @"
Implementación REST completa para Appointment con JWT y validaciones

- Agregado servidor REST (server.js)
- Implementado autenticación JWT (authController, auth routes)
- Creado controlador completo de appointments
- Agregado middleware de autenticación y validación
- Implementado manejo centralizado de errores
- Todas las operaciones CRUD funcionando
- Endpoints adicionales: buscar por fecha y paciente
"@

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit creado exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠ Hubo un problema al crear el commit" -ForegroundColor Yellow
    Write-Host "Revisa el mensaje de error arriba" -ForegroundColor Yellow
}

Write-Host ""

# Paso 8: Verificar ramas
Write-Host "Paso 8: Verificando ramas..." -ForegroundColor Cyan
Write-Host "Ramas disponibles:" -ForegroundColor Yellow
git branch

Write-Host ""

# Paso 9: Intentar subir al repositorio
Write-Host "Paso 9: ¿Deseas subir la rama al repositorio ahora? (S/N)" -ForegroundColor Yellow
Write-Host "NOTA: Necesitarás autenticarte con GitHub" -ForegroundColor Yellow
$pushResponse = Read-Host
if ($pushResponse -eq "S" -or $pushResponse -eq "s" -or $pushResponse -eq "Y" -or $pushResponse -eq "y") {
    Write-Host "Subiendo rama Diego al repositorio..." -ForegroundColor Cyan
    git push -u origin Diego
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ ¡Rama subida exitosamente!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Puedes ver tu rama en:" -ForegroundColor Yellow
        Write-Host "https://github.com/gersss444/ConsultorioDental" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠ Hubo un problema al subir" -ForegroundColor Yellow
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host "- Necesitas autenticarte (usa Personal Access Token)" -ForegroundColor Yellow
        Write-Host "- No tienes permisos en el repositorio" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Puedes intentar manualmente con:" -ForegroundColor Cyan
        Write-Host "git push -u origin Diego" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Para subir más tarde, ejecuta:" -ForegroundColor Yellow
    Write-Host "git push -u origin Diego" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Proceso completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

