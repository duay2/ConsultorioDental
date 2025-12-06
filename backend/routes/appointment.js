const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authenticateToken = require('../middlewares/auth');
const {
    validateCreateAppointment,
    validateUpdateAppointment,
    validateAppointmentId,
    validateUpdateStatus,
    validateDate,
    validatePatientId,
    validatePagination
} = require('../middlewares/validation');

/**
 * Rutas para gestión de citas (Appointments)
 * Todas las rutas requieren autenticación JWT
 */

// Ruta para obtener todas las citas con paginación
// GET /api/appointments?page=1&limit=10
router.get(
    '/',
    authenticateToken,
    validatePagination,
    appointmentController.getAllAppointments
);

// Ruta para obtener citas por fecha
// GET /api/appointments/date?date=2024-01-15
router.get(
    '/date',
    authenticateToken,
    validateDate,
    appointmentController.getAppointmentsByDate
);

// Ruta para obtener citas por paciente
// GET /api/appointments/patient?patient_id=1
router.get(
    '/patient',
    authenticateToken,
    validatePatientId,
    appointmentController.getAppointmentsByPatient
);

// Ruta para obtener una cita por ID
// GET /api/appointments/:id
router.get(
    '/:id',
    authenticateToken,
    validateAppointmentId,
    appointmentController.getAppointmentById
);

// Ruta para crear una nueva cita
// POST /api/appointments
router.post(
    '/',
    authenticateToken,
    validateCreateAppointment,
    appointmentController.createAppointment
);

// Ruta para actualizar una cita completa
// PUT /api/appointments/:id
router.put(
    '/:id',
    authenticateToken,
    validateUpdateAppointment,
    appointmentController.updateAppointment
);

// Ruta para actualizar el estado de una cita
// PATCH /api/appointments/:id/status
router.patch(
    '/:id/status',
    authenticateToken,
    validateUpdateStatus,
    appointmentController.updateAppointmentStatus
);

// Ruta para eliminar una cita
// DELETE /api/appointments/:id
router.delete(
    '/:id',
    authenticateToken,
    validateAppointmentId,
    appointmentController.deleteAppointment
);

module.exports = router;

