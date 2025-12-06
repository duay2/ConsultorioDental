# Frontend - Consultorio Dental

Aplicación web frontend desarrollada con JavaScript vanilla y Web Components para la gestión de consultorio dental.

## Requisitos
- Servidor HTTP (puede usar `serve` o cualquier servidor estático)

## Instalación

No requiere instalación de dependencias npm. Los archivos están listos para servir.

Si deseas usar un servidor local, puedes instalar `serve` globalmente:

```bash
npm install -g serve
```

## Ejecución

### Con serve (recomendado)
```bash
serve public -l 5000
```

### Con cualquier servidor estático
Servir la carpeta `public/` con cualquier servidor HTTP estático.

La aplicación estará disponible en `http://localhost:5000`

## Estructura del Proyecto

```
frontend/
└── public/
    ├── index.html              # Punto de entrada
    ├── css/
    │   └── style.css          # Estilos principales
    └── js/
        ├── app.js             # Módulo principal
        ├── components/        # Componentes Web
        │   ├── auth/          # Componentes de autenticación
        │   ├── dashboard/     # Componentes del dashboard
        │   ├── patients/      # Componentes de pacientes
        │   ├── appointments/  # Componentes de citas
        │   ├── dental-records/# Componentes de registros
        │   ├── inventory/     # Componentes de inventario
        │   └── common/        # Componentes compartidos
        └── services/          # Servicios de API
            ├── auth-service.js
            ├── patient-service.js
            ├── appointment-service.js
            ├── dental-records-service.js
            ├── inventory-service.js
            └── user-service.js
```

## Características

- Interfaz de usuario moderna y responsive
- Autenticación con JWT
- Gestión de pacientes con búsqueda y filtros
- Agendamiento de citas con vista de agenda diaria
- Registros dentales con historial completo
- Control de inventario con alertas de stock
- Dashboard con estadísticas y actividades recientes
- Paginación en tablas
- Modales para crear y editar registros

## Configuración

La URL del backend se configura en los servicios. Por defecto apunta a:
```
http://localhost:3000
```

Para cambiar la URL del backend, editar los archivos en `public/js/services/` y actualizar la constante `API_BASE_URL`.

## Tecnologías

- JavaScript ES6+ (módulos)
- Web Components (Custom Elements)
- CSS3
- Fetch API para comunicación con backend

## Módulos Principales

### Componentes
- `navbar.js` - Barra de navegación
- `login-view.js` - Vista de login
- `dashboard-view.js` - Panel principal
- `patient-view.js` - Gestión de pacientes
- `appointments-view.js` - Gestión de citas
- `dental-records-view.js` - Registros dentales
- `inventory-view.js` - Control de inventario

### Servicios
- `auth-service.js` - Autenticación y autorización
- `patient-service.js` - Operaciones con pacientes
- `appointment-service.js` - Operaciones con citas
- `dental-records-service.js` - Operaciones con registros
- `inventory-service.js` - Operaciones con inventario
- `user-service.js` - Operaciones con usuarios

## Uso

1. Asegúrate de que el backend esté corriendo
2. Inicia el servidor del frontend
3. Abre el navegador en la URL del servidor
4. Inicia sesión con tus credenciales
5. Navega por las diferentes secciones del sistema

## Notas

- El frontend requiere que el backend esté activo para funcionar correctamente
- Las peticiones al backend incluyen automáticamente el token JWT cuando el usuario está autenticado
- Los errores de autenticación redirigen automáticamente al login

