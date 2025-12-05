const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar conexión a base de datos
const databaseConnection = require('./config/database');

// Importar rutas
const appointmentRoutes = require('./routes/appointment');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dentalRecordsRoutes = require('./routes/dentalRecordsRoutes');
const patientRoutes = require('./routes/patient');

// Importar middleware de manejo de errores
const errorHandler = require('./middlewares/errorHandler');

// Crear aplicación Express
const app = express();

// Middlewares globales
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON en el body
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded

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

// Rutas de users (requieren JWT)
app.use('/api/users', userRoutes);

// Rutas de dental records (requieren JWT)
app.use('/api/dental-records', dentalRecordsRoutes);

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
            'GET /api/users',
            'GET /api/users/:id',
            'GET /api/users/email?email=xxx@xxx.com',
            'GET /api/users/role?role=doctor',
            'GET /api/users/search?name=Juan',
            'POST /api/users',
            'PUT /api/users/:id',
            'DELETE /api/users/:id',
            'GET /api/dentalrecords',
            'GET /api/dentalrecords/:id',
            'GET /api/dentalrecords/patient?patient_id=N',
            'POST /api/dentalrecords',
            'PUT /api/dentalrecords/:id',
            'PATCH /api/dentalrecords/:id',
            'DELETE /api/dentalrecords/:id',
            'GET /api/patients',
            'GET /api/patients/:id',
            'GET /api/patients/search?q=nombre',
            'GET /api/patients/email?email=xxx@xxx.com',
            'POST /api/patients',
            'PUT /api/patients/:id',
            'DELETE /api/patients/:id',
            'POST /api/patients/:id/orthodontics/adjustments'
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
            console.log(`Users: http://localhost:${PORT}/api/users`);
            console.log(`Dental Records: http://localhost:${PORT}/api/dentalrecords`);
            console.log(`Patients: http://localhost:${PORT}/api/patients`);
            console.log('='.repeat(60));
            console.log('NOTA: Todas las rutas requieren autenticación JWT');
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

