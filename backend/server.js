const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); // Importar morgan para logging HTTP
require('dotenv').config();

// Importar conexión a base de datos
const databaseConnection = require('./config/database');

// Importar rutas
const appointmentRoutes = require('./routes/appointment');
const authRoutes = require('./routes/auth');
const dentalRecordsRoutes = require('./routes/dental-recordsRoutes');
const inventoryRoutes = require('./routes/inventory');
const patientRoutes = require('./routes/patient');

// Importar middleware de manejo de errores
const errorHandler = require('./middlewares/errorHandler');

// Crear aplicación Express
const app = express();

// Middlewares globales
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded
app.use(morgan('dev')); // Añadir logging HTTP con morgan

// // Servir archivos estáticos del frontend (comentado, ahora se servirá por separado)
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Health check endpoint (no requiere autenticación)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servicio REST de Consultorio Dental está funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación (no requieren JWT)
app.use('/api/auth', authRoutes);

// Rutas de appointments (requieren JWT)
app.use('/api/appointments', appointmentRoutes);

// Rutas de dental records (requieren JWT)
app.use('/api/dental-records', dentalRecordsRoutes);

// Rutas de inventory (requieren JWT)
app.use('/api/inventory', inventoryRoutes);

// Rutas de patients (requieren JWT)
app.use('/api/patients', patientRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.method} ${req.path} no existe`,
        availableRoutes: [
            'GET /health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/appointments',
            'GET /api/appointments/:id',
            'GET /api/appointments/date?date=YYYY-MM-DD',
            'GET /api/appointments/patient?patient_id=N',
            'POST /api/appointments',
            'PUT /api/appointments/:id',
            'PATCH /api/appointments/:id/status',
            'DELETE /api/appointments/:id',
            'GET /api/dental-records',
            'GET /api/dental-records/:id',
            'GET /api/dental-records/patient?patient_id=N',
            'POST /api/dental-records',
            'PUT /api/dental-records/:id',
            'PATCH /api/dental-records/:id',
            'DELETE /api/dental-records/:id',
            'GET /api/inventory',
            'GET /api/inventory/:id',
            'GET /api/inventory/category?category=X',
            'GET /api/inventory/search?name=X',
            'POST /api/inventory',
            'PUT /api/inventory/:id',
            'PATCH /api/inventory/:id/stock',
            'DELETE /api/inventory/:id'
        ]
    });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
async function startServer() {
    try {
        // Conectar a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('Servicio REST - Consultorio Dental');
            console.log('='.repeat(60));
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Login: POST http://localhost:${PORT}/api/auth/login`);
            console.log(`Appointments: http://localhost:${PORT}/api/appointments`);
            console.log(`Dental Records: http://localhost:${PORT}/api/dental-records`);
            console.log(`Inventory: http://localhost:${PORT}/api/inventory`);
            console.log(`Patients: http://localhost:${PORT}/api/patients`);
            console.log('='.repeat(60));
            console.log('NOTA: Todas las rutas de API requieren autenticación JWT, excepto /api/auth/register y /api/auth/login');
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('\nCerrando servidor...');
    try {
        if (databaseConnection.isConnectionActive()) {
            await databaseConnection.disconnect();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\nCerrando servidor...');
    try {
        if (databaseConnection.isConnectionActive()) {
            await databaseConnection.disconnect();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar:', error);
        process.exit(1);
    }
});

// Iniciar servidor solo si es el archivo principal
if (require.main === module) {
    startServer();
}

module.exports = app;

