# Backend - API REST Consultorio Dental

API REST desarrollada con Node.js y Express para la gestión de un consultorio dental.

## Requisitos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm

## Instalación

```bash
npm install
```

## Ejecución

### Modo Producción
```bash
npm start
```

### Modo Desarrollo
```bash
npm run dev
```

## Estructura del Proyecto

```
backend/
├── config/           # Configuración de base de datos
├── controllers/      # Lógica de negocio
├── middlewares/     # Middlewares (auth, validación, errores)
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
└── server.js        # Punto de entrada
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Pacientes
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:id` - Obtener paciente
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### Citas
- `GET /api/appointments` - Listar citas
- `GET /api/appointments/:id` - Obtener cita
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Registros Dentales
- `GET /api/dental-records` - Listar registros
- `GET /api/dental-records/:id` - Obtener registro
- `POST /api/dental-records` - Crear registro
- `PUT /api/dental-records/:id` - Actualizar registro
- `DELETE /api/dental-records/:id` - Eliminar registro

### Inventario
- `GET /api/inventory` - Listar inventario
- `GET /api/inventory/:id` - Obtener item
- `POST /api/inventory` - Crear item
- `PUT /api/inventory/:id` - Actualizar item
- `DELETE /api/inventory/:id` - Eliminar item

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Health Check
- `GET /health` - Verificar estado del servidor

## Autenticación

Todas las rutas (excepto `/api/auth/*` y `/health`) requieren autenticación JWT.

Incluir el token en el header:
```
Authorization: Bearer <token_jwt>
```

## Dependencias Principales

- express: Framework web
- mongodb: Driver de MongoDB
- jsonwebtoken: Autenticación JWT
- express-validator: Validación de datos
- cors: Manejo de CORS
- dotenv: Variables de entorno
- morgan: Logging HTTP

## Base de Datos

El sistema utiliza MongoDB con las siguientes colecciones:
- users
- patients
- appointments
- dental-records
- inventory

Los índices se crean automáticamente al iniciar el servidor.

