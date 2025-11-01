# Sistema REST API - Consultorio Dental

API REST para gestión de consultorio dental. Se utiliza Postman para probar todos los endpoints.

## 1. Instalar dependencias
```bash
npm install
```

## 2. Configurar Base de Datos
- Crear base de datos MongoDB con nombre: `consultorio_dental`
- Configurar la cadena de conexión en el archivo `.env`

## 3. Iniciar el servidor
```bash
npm start
```
o en modo desarrollo:
```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` (o el puerto configurado en `.env`)

## Uso con Postman

Una vez iniciado el servidor, puedes probar todos los endpoints con Postman:

### Endpoints disponibles:
- `GET /health` - Health check
- `POST /api/auth/register` - Registrar nuevo usuario (obtiene token automáticamente)
- `POST /api/auth/login` - Iniciar sesión y obtener token JWT
- `GET /api/appointments` - Listar citas (requiere JWT)
- `GET /api/appointments/:id` - Obtener cita por ID (requiere JWT)
- `POST /api/appointments` - Crear nueva cita (requiere JWT)
- `PUT /api/appointments/:id` - Actualizar cita (requiere JWT)
- `PATCH /api/appointments/:id/status` - Actualizar estado de cita (requiere JWT)
- `DELETE /api/appointments/:id` - Eliminar cita (requiere JWT)

### Nota
Todas las rutas de `/api/appointments` requieren autenticación JWT. Debes incluir el token en el header:
```
Authorization: Bearer <tu_token_jwt>
```

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




