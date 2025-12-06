# Sistema REST API - Consultorio Dental

APP FULLSTACK
## 1. Instalar dependencias
En la raiz del proyecto 
```bash
npm install
```
```bash
npm install -g serve
```
cd backend
```bash
npm install
```
## 2. Ejecución de Backend y Frontend
```bash
npm start
```

API REST para gestión de consultorio dental.

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar Base de Datos
- Crear base de datos MongoDB con nombre: `consultorio_dental`


## 3. Iniciar el servidor
```bash
npm start
```
o en modo desarrollo:
```bash
npm run dev
```

## Uso con Postman

Una vez iniciado el servidor, puedes probar todos los endpoints con Postman:

### Endpoints disponibles:

#### Autenticación
- `GET /health` - Health check
- `POST /api/auth/register` - Registrar nuevo usuario (obtiene token automáticamente)
- `POST /api/auth/login` - Iniciar sesión y obtener token JWT

#### Appointments (Citas)
- `GET /api/appointments` - Listar citas con paginación (requiere JWT)
- `GET /api/appointments/:id` - Obtener cita por ID (requiere JWT)
- `GET /api/appointments/date?date=YYYY-MM-DD` - Buscar citas por fecha (requiere JWT)
- `GET /api/appointments/patient?patient_id=N` - Buscar citas por paciente (requiere JWT)
- `POST /api/appointments` - Crear nueva cita (requiere JWT)
- `PUT /api/appointments/:id` - Actualizar cita completa (requiere JWT)
- `PATCH /api/appointments/:id/status` - Actualizar estado de cita (requiere JWT)
- `DELETE /api/appointments/:id` - Eliminar cita (requiere JWT)

#### Dental Records (Registros Dentales)
- `GET /api/dental-records` - Listar todos los registros dentales sin paginación (requiere JWT)
- `GET /api/dental-records/:id` - Obtener registro dental por ID (requiere JWT)
- `GET /api/dental-records/patient?patient_id=N` - Buscar registros por paciente (requiere JWT)
- `POST /api/dental-records` - Crear nuevo registro dental (requiere JWT, valida que patient_id exista)
- `PUT /api/dental-records/:id` - Actualizar registro dental completo (requiere JWT)
- `PATCH /api/dental-records/:id` - Actualizar varios campos del registro (requiere JWT)
- `DELETE /api/dental-records/:id` - Eliminar registro dental (requiere JWT)


## Primer uso

1. **Registra tu primer usuario** con `POST /api/auth/register`:
```json
{
    "email": "admin@consultorio.com",
    "password": "tu_password_segura",
    "name": "Administrador",
    "role": "admin"
}
```

2. El registro automáticamente te devuelve un token JWT que puedes usar para las demás peticiones.

3. Para futuros accesos, usa `POST /api/auth/login` con tus credenciales.

## Ejemplos de uso con Dental Records

### Crear un registro dental
```json
POST /api/dental-records
{
    "patient_id": 1,
    "description": "Limpieza dental profunda",
    "diagnosis": "Gingivitis leve",
    "treatment_plan": "Limpieza y aplicación de flúor",
    "treatment_notes": "Paciente requiere seguimiento",
    "treatment_cost": 500,
    "payment_status": "pending",
    "record_type": "general"
}
```

**Nota importante:** El `patient_id` debe existir en la base de datos. Si intentas usar un `patient_id` que no existe, recibirás un error 400.

### Actualizar varios campos (PATCH)
```json
PATCH /api/dental-records/:id
{
    "payment_status": "paid",
    "treatment_cost": 600,
    "description": "Descripción actualizada"
}
```

### Nota sobre autenticación
Para acceder a las rutas Debes incluir el token en el header:
```
Authorization: Bearer <tu_token_jwt>
```

---

## Módulo de Pacientes

Se implementó la funcionalidad completa correspondiente al manejo de pacientes dentro del sistema REST API del Consultorio Dental.

---

## Módulo de Pacientes

Se implementó la funcionalidad completa correspondiente al manejo de pacientes dentro del sistema REST API del Consultorio Dental.

### Cambios realizados
- Creación del controlador de pacientes con las operaciones CRUD
- Definición de rutas específicas para la gestión de pacientes
- Validaciones de datos en las solicitudes de creación y actualización
- Manejo de errores y respuestas consistentes en las operaciones del módulo
- Conexión con la base de datos para registrar, consultar, modificar y eliminar información de pacientes

---

