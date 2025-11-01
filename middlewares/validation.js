const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Error de validación',
            message: 'Los datos proporcionados no son válidos',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validaciones para crear una cita (POST)
 */
const validateCreateAppointment = [
    body('appointment_date')
        .notEmpty().withMessage('La fecha de la cita es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('appointment_time')
        .notEmpty().withMessage('La hora de la cita es requerida')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe estar en formato HH:MM (24 horas)'),
    body('type')
        .notEmpty().withMessage('El tipo de cita es requerido')
        .isString().withMessage('El tipo debe ser una cadena de texto')
        .trim(),
    body('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto'),
    body('patient_info')
        .notEmpty().withMessage('La información del paciente es requerida')
        .isObject().withMessage('patient_info debe ser un objeto'),
    body('patient_info.id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    body('patient_info.name')
        .optional()
        .isString().withMessage('El nombre del paciente debe ser una cadena de texto'),
    body('doctor_info')
        .notEmpty().withMessage('La información del doctor es requerida')
        .isObject().withMessage('doctor_info debe ser un objeto'),
    body('doctor_info._id')
        .optional()
        .isString().withMessage('El ID del doctor debe ser una cadena de texto'),
    body('doctor_info.name')
        .optional()
        .isString().withMessage('El nombre del doctor debe ser una cadena de texto'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo en minutos'),
    handleValidationErrors
];

/**
 * Validaciones para actualizar una cita (PUT)
 */
const validateUpdateAppointment = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('appointment_date')
        .optional()
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('appointment_time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora debe estar en formato HH:MM (24 horas)'),
    body('type')
        .optional()
        .isString().withMessage('El tipo debe ser una cadena de texto')
        .trim(),
    body('status')
        .optional()
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    body('notes')
        .optional()
        .isString().withMessage('Las notas deben ser una cadena de texto'),
    body('patient_info')
        .optional()
        .isObject().withMessage('patient_info debe ser un objeto'),
    body('doctor_info')
        .optional()
        .isObject().withMessage('doctor_info debe ser un objeto'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 1 }).withMessage('La duración debe ser un número entero positivo en minutos'),
    handleValidationErrors
];

/**
 * Validaciones para obtener una cita por ID
 */
const validateAppointmentId = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validaciones para actualizar el estado de una cita
 */
const validateUpdateStatus = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('status')
        .notEmpty().withMessage('El estado es requerido')
        .isIn(['scheduled', 'completed', 'cancelled', 'rescheduled']).withMessage('El estado debe ser: scheduled, completed, cancelled o rescheduled'),
    handleValidationErrors
];

/**
 * Validaciones para buscar citas por fecha
 */
const validateDate = [
    query('date')
        .notEmpty().withMessage('La fecha es requerida')
        .isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
    handleValidationErrors
];

/**
 * Validaciones para buscar citas por paciente
 */
const validatePatientId = [
    query('patient_id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validaciones para paginación
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
    handleValidationErrors
];

module.exports = {
    validateCreateAppointment,
    validateUpdateAppointment,
    validateAppointmentId,
    validateUpdateStatus,
    validateDate,
    validatePatientId,
    validatePagination,
    handleValidationErrors
};

