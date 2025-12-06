# Consultorio Dental - Sistema de Gestión

Sistema full-stack para la gestión integral de un consultorio dental, incluyendo pacientes, citas, registros dentales, inventario y usuarios.

## Estructura del Proyecto

```
ConsultorioDental/
├── backend/          # API REST con Node.js y Express
├── frontend/         # Aplicación web con JavaScript vanilla
└── public/           # Servicios compartidos
```

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias del proyecto raíz:
```bash
npm install
```

3. Instalar dependencias del backend:
```bash
cd backend
npm install
cd ..
```

4. Instalar dependencias del frontend (si es necesario):
```bash
cd frontend
npm install
cd ..
```

5. Instalar herramientas globales:
```bash
npm install -g serve
```


```

1. Asegurarse de que MongoDB esté corriendo

## Ejecución

### Desarrollo (Backend y Frontend simultáneamente)

Desde la raíz del proyecto:
```bash
npm start
```

Esto iniciará:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5000`

### Ejecución Separada

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
serve public -l 5000
```

## Módulos del Sistema

- **Autenticación**: Login y registro de usuarios con JWT
- **Pacientes**: Gestión completa de información de pacientes
- **Citas**: Agendamiento y gestión de citas médicas
- **Registros Dentales**: Historial clínico de tratamientos
- **Inventario**: Control de stock de materiales y productos
- **Usuarios**: Administración de usuarios del sistema
- **Dashboard**: Panel de control con estadísticas y actividades

## Tecnologías

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: JavaScript vanilla, Web Components
- **Base de Datos**: MongoDB


