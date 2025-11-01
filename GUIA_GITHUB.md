# 🚀 Guía para Subir Cambios a GitHub - Rama Diego

Esta guía te ayudará a conectar tu proyecto local con el repositorio de GitHub y crear tu rama personal.

## 📋 Prerrequisitos

1. **Verificar que Git esté instalado:**
   ```bash
   git --version
   ```
   Si no está instalado, descarga Git desde: https://git-scm.com/download/win

2. **Verificar que tienes acceso al repositorio:**
   - URL: https://github.com/gersss444/ConsultorioDental
   - Asegúrate de que tu compañero te haya dado permisos de colaborador

---

## 🔧 Paso 1: Inicializar Git (si no está inicializado)

Abre PowerShell o Git Bash en la carpeta del proyecto y ejecuta:

```bash
cd c:\Users\diegs\Downloads\Asig08

# Verificar si ya es un repositorio git
git status

# Si dice "not a git repository", inicialízalo:
git init
```

---

## 🔗 Paso 2: Conectar con el Repositorio Remoto

```bash
# Agregar el repositorio remoto (si no está configurado)
git remote add origin https://github.com/gersss444/ConsultorioDental.git

# Verificar que se agregó correctamente
git remote -v
```

Si el repositorio remoto ya existe y quieres cambiarlo:
```bash
git remote set-url origin https://github.com/gersss444/ConsultorioDental.git
```

---

## 📥 Paso 3: Obtener el Código Actual del Repositorio

Como recibiste el proyecto por ZIP, primero necesitas traer los cambios del repositorio:

```bash
# Obtener la rama main del repositorio
git fetch origin

# Ver qué ramas hay en el repositorio
git branch -r

# Traer el código de la rama main (si existe)
git pull origin main --allow-unrelated-histories
```

**Nota:** El flag `--allow-unrelated-histories` permite fusionar historiales no relacionados (tu proyecto local con el remoto).

---

## 🌿 Paso 4: Crear tu Rama Personal "Diego"

**⚠️ IMPORTANTE:** Si es un proyecto nuevo sin commits, primero debes hacer tu primer commit antes de crear la rama, o simplemente crear la rama directamente (Git creará la rama automáticamente).

```bash
# Opción A: Si ya hay commits en el repositorio remoto
# Primero traer los cambios:
git fetch origin
git checkout -b main origin/main
# O si la rama se llama master:
git checkout -b main origin/master

# Luego crear tu rama:
git checkout -b Diego

# Opción B: Si es un proyecto nuevo sin commits
# Simplemente crea tu rama directamente:
git checkout -b Diego

# NOTA: git branch no mostrará nada hasta que hagas tu primer commit
# Esto es normal, continúa con los siguientes pasos
```

---

## 📝 Paso 5: Crear Archivo .gitignore (Importante)

Antes de hacer commit, crea un archivo `.gitignore` para no subir archivos innecesarios:

**Crea el archivo `.gitignore` en la raíz del proyecto:**

```
# Dependencias
node_modules/
package-lock.json

# Variables de entorno
.env
.env.local

# Logs
*.log
npm-debug.log*

# Sistema operativo
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Archivos temporales
*.tmp
.cache/
```

---

## ✅ Paso 6: Agregar tus Cambios

```bash
# Ver qué archivos has modificado/creado
git status

# IMPORTANTE: Si hay archivos que no quieres subir, primero revisa .gitignore
# El archivo .gitignore ya debería estar creado para excluir node_modules/

# Agregar todos los archivos nuevos y modificados
git add .

# O agregar archivos específicos:
# git add controllers/
# git add routes/
# git add middlewares/
# git add server.js
# git add package.json
# git add .gitignore
```

**Nota:** Si ves un error sobre archivos que no se pueden agregar, probablemente sean `node_modules/`. Asegúrate de que `.gitignore` esté creado correctamente.

---

## 💾 Paso 7: Hacer Commit

**⚠️ Esto creará tu primer commit y entonces sí podrás ver las ramas con `git branch`**

```bash
# Hacer commit con un mensaje descriptivo
git commit -m "Implementación REST completa para Appointment con JWT y validaciones

- Agregado servidor REST (server.js)
- Implementado autenticación JWT (authController, auth routes)
- Creado controlador completo de appointments
- Agregado middleware de autenticación y validación
- Implementado manejo centralizado de errores
- Todas las operaciones CRUD funcionando
- Endpoints adicionales: buscar por fecha y paciente"

# Ahora sí verás las ramas:
git branch
# Deberías ver un asterisco (*) junto a "Diego"
```

---

## 📤 Paso 8: Subir tu Rama al Repositorio

```bash
# Subir tu rama "Diego" al repositorio remoto
git push -u origin Diego

# Si te pide autenticación:
# - Usa tu token de GitHub (no tu contraseña)
# - O configura SSH keys
```

**Si es la primera vez que subes la rama, el `-u` configura el tracking para futuros pushes.**

---

## 🔄 Pasos Completos (Comando por Comando)

Aquí están todos los comandos en orden:

```bash
# 1. Ir a la carpeta del proyecto
cd c:\Users\diegs\Downloads\Asig08

# 2. Inicializar git (si no está inicializado)
git init

# 3. Conectar con el repositorio remoto
git remote add origin https://github.com/gersss444/ConsultorioDental.git

# 4. Traer el código del repositorio
git fetch origin
git pull origin main --allow-unrelated-histories

# 5. Crear y cambiar a tu rama
git checkout -b Diego

# 6. Crear .gitignore (manual - crear el archivo con el contenido de arriba)

# 7. Agregar cambios
git add .

# 8. Hacer commit
git commit -m "Implementación REST completa para Appointment con JWT y validaciones"

# 9. Subir tu rama
git push -u origin Diego
```

---

## ⚠️ Solución de Problemas Comunes

### Error: "Permission denied" o "Authentication failed"

**Solución:** Necesitas autenticarte con GitHub:

1. **Opción A - Personal Access Token:**
   - Ve a GitHub → Settings → Developer settings → Personal access tokens
   - Genera un nuevo token con permisos `repo`
   - Úsalo como contraseña cuando te lo pida

2. **Opción B - Configurar Git Credential Helper:**
   ```bash
   git config --global credential.helper wincred
   ```

### Error: "branch 'main' does not exist"

Si la rama principal se llama `master` en lugar de `main`:

```bash
git pull origin master --allow-unrelated-histories
```

### Error: "refusing to merge unrelated histories"

Ya incluimos el flag `--allow-unrelated-histories` en el comando de pull.

### Si hay conflictos al hacer pull:

```bash
# Si hay conflictos, resuélvelos y luego:
git add .
git commit -m "Resolución de conflictos con rama main"
git push -u origin Diego
```

---

## 🔍 Verificar que todo esté bien

Después de subir, verifica en GitHub:

1. Ve a: https://github.com/gersss444/ConsultorioDental
2. Haz clic en el dropdown de ramas (donde dice "main")
3. Deberías ver tu rama "Diego"
4. Selecciona tu rama y verifica que todos tus archivos estén ahí

---

## 📋 Resumen de Archivos que Debes Subir

Asegúrate de que estos archivos estén incluidos:

```
✅ server.js
✅ controllers/
   ✅ authController.js
   ✅ appointmentController.js
✅ routes/
   ✅ auth.js
   ✅ appointment.js
✅ middlewares/
   ✅ auth.js
   ✅ errorHandler.js
   ✅ validation.js
✅ package.json (modificado)
```

**NO subir:**
- ❌ node_modules/ (se instala con npm install)
- ❌ .env (variables de entorno sensibles)
- ❌ Archivos temporales

---

## 🎯 Después de Subir

1. **Crear un Pull Request:**
   - Ve al repositorio en GitHub
   - Deberías ver un banner sugiriendo crear un PR
   - O ve a "Pull requests" → "New pull request"
   - Selecciona: base `main` ← compare `Diego`
   - Describe tus cambios
   - Solicita revisión a tu compañero

2. **Mantener tu rama actualizada:**
   ```bash
   # Cuando quieras actualizar con cambios de main:
   git checkout main
   git pull origin main
   git checkout Diego
   git merge main
   ```

---

¡Listo! Con estos pasos deberías poder subir tus cambios sin problemas. 🚀

