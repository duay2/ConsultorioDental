const Appointment = require('../models/Appointment');
const databaseConnection = require('../config/database');

/**
 * Obtener todas las citas con paginación
 * GET /api/appointments?page=1&limit=10
 */
const getAllAppointments = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const appointmentModel = new Appointment();
        const result = await appointmentModel.findAll(page, limit);

        res.status(200).json({
            message: 'Citas obtenidas exitosamente',
            data: result.appointments,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener una cita por ID
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const appointmentId = parseInt(req.params.id);
        const appointmentModel = new Appointment();
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                error: 'Cita no encontrada',
                message: `No se encontró una cita con ID ${appointmentId}`
            });
        }

        res.status(200).json({
            message: 'Cita obtenida exitosamente',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear una nueva cita
 * POST /api/appointments
 */
const createAppointment = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const appointmentModel = new Appointment();
        const appointment = await appointmentModel.create(req.body);

        res.status(201).json({
            message: 'Cita creada exitosamente',
            data: appointment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar una cita
 * PUT /api/appointments/:id
 */
const updateAppointment = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const appointmentId = parseInt(req.params.id);
        const appointmentModel = new Appointment();

        // Verificar que la cita existe
        const existingAppointment = await appointmentModel.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({
                error: 'Cita no encontrada',
                message: `No se encontró una cita con ID ${appointmentId}`
            });
        }

        // Actualizar la cita
        const result = await appointmentModel.update(appointmentId, req.body);

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo actualizar la cita',
                message: 'La cita no fue modificada'
            });
        }

        // Obtener la cita actualizada
        const updatedAppointment = await appointmentModel.findById(appointmentId);

        res.status(200).json({
            message: 'Cita actualizada exitosamente',
            data: updatedAppointment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar una cita
 * DELETE /api/appointments/:id
 */
const deleteAppointment = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const appointmentId = parseInt(req.params.id);
        const appointmentModel = new Appointment();

        // Verificar que la cita existe
        const existingAppointment = await appointmentModel.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({
                error: 'Cita no encontrada',
                message: `No se encontró una cita con ID ${appointmentId}`
            });
        }

        // Eliminar la cita
        const result = await appointmentModel.delete(appointmentId);

        if (result.deletedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo eliminar la cita',
                message: 'La cita no fue eliminada'
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener citas por fecha
 * GET /api/appointments/date?date=2024-01-15
 */
const getAppointmentsByDate = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const date = new Date(req.query.date);
        const appointmentModel = new Appointment();
        const appointments = await appointmentModel.findByDate(date);

        res.status(200).json({
            message: 'Citas obtenidas exitosamente',
            date: req.query.date,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener citas por paciente
 * GET /api/appointments/patient?patient_id=1
 */
const getAppointmentsByPatient = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const patientId = parseInt(req.query.patient_id);
        const appointmentModel = new Appointment();
        const appointments = await appointmentModel.findByPatient(patientId);

        res.status(200).json({
            message: 'Citas obtenidas exitosamente',
            patient_id: patientId,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar el estado de una cita
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const appointmentId = parseInt(req.params.id);
        const { status } = req.body;
        const appointmentModel = new Appointment();

        // Verificar que la cita existe
        const existingAppointment = await appointmentModel.findById(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({
                error: 'Cita no encontrada',
                message: `No se encontró una cita con ID ${appointmentId}`
            });
        }

        // Actualizar el estado
        const result = await appointmentModel.updateStatus(appointmentId, status);

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo actualizar el estado',
                message: 'El estado de la cita no fue modificado'
            });
        }

        // Obtener la cita actualizada
        const updatedAppointment = await appointmentModel.findById(appointmentId);

        res.status(200).json({
            message: 'Estado de cita actualizado exitosamente',
            data: updatedAppointment
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    updateAppointmentStatus
};

