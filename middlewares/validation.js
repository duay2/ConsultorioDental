const { body, param, query, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const databaseConnection = require('../config/database');

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

/**
 * Middleware personalizado para validar que el patient_id existe
 */
const validatePatientExists = async (req, res, next) => {
    const patientId = req.body.patient_id;
    
    if (!patientId) {
        return next(); // Si no hay patient_id, la validación normal lo detectará
    }
    
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }
        
        const patientModel = new Patient();
        const patient = await patientModel.findById(patientId);
        
        if (!patient) {
            return res.status(400).json({
                error: 'Paciente no encontrado',
                message: `No existe un paciente con ID ${patientId}`
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Error al validar paciente',
            message: error.message
        });
    }
};

/**
 * Validaciones para crear un registro dental (POST)
 */
const validateCreateDentalRecord = [
    body('patient_id')
        .notEmpty().withMessage('El ID del paciente es requerido')
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo'),
    body('description')
        .notEmpty().withMessage('La descripción es requerida')
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('diagnosis')
        .notEmpty().withMessage('El diagnóstico es requerido')
        .isString().withMessage('El diagnóstico debe ser una cadena de texto')
        .trim(),
    body('treatment_plan')
        .notEmpty().withMessage('El plan de tratamiento es requerido')
        .isString().withMessage('El plan de tratamiento debe ser una cadena de texto')
        .trim(),
    body('treatment_notes')
        .optional()
        .isString().withMessage('Las notas de tratamiento deben ser una cadena de texto')
        .trim(),
    body('file_path')
        .optional()
        .isString().withMessage('La ruta del archivo debe ser una cadena de texto')
        .trim(),
    body('next_appointment')
        .optional()
        .isISO8601().withMessage('La próxima cita debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('treatment_cost')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo del tratamiento debe ser un número positivo'),
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial']).withMessage('El estado de pago debe ser: pending, paid o partial'),
    body('record_type')
        .optional()
        .isIn(['general', 'orthodontic', 'surgery']).withMessage('El tipo de registro debe ser: general, orthodontic o surgery'),
    body('created_by_info')
        .optional()
        .isObject().withMessage('created_by_info debe ser un objeto'),
    handleValidationErrors
];

/**
 * Validaciones para actualizar un registro dental (PUT)
 */
const validateUpdateDentalRecord = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('patient_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID del paciente debe ser un número entero positivo')
        .custom(async (value) => {
            // Solo validar si el patient_id está presente
            if (!value) return true;
            
            try {
                if (!databaseConnection.isConnectionActive()) {
                    await databaseConnection.connect();
                }
                
                const patientModel = new Patient();
                const patient = await patientModel.findById(value);
                
                if (!patient) {
                    throw new Error(`No existe un paciente con ID ${value}`);
                }
                
                return true;
            } catch (error) {
                throw error;
            }
        }),
    body('description')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim(),
    body('diagnosis')
        .optional()
        .isString().withMessage('El diagnóstico debe ser una cadena de texto')
        .trim(),
    body('treatment_plan')
        .optional()
        .isString().withMessage('El plan de tratamiento debe ser una cadena de texto')
        .trim(),
    body('treatment_notes')
        .optional()
        .isString().withMessage('Las notas de tratamiento deben ser una cadena de texto')
        .trim(),
    body('file_path')
        .optional()
        .isString().withMessage('La ruta del archivo debe ser una cadena de texto')
        .trim(),
    body('next_appointment')
        .optional()
        .isISO8601().withMessage('La próxima cita debe estar en formato ISO8601 (YYYY-MM-DD)'),
    body('treatment_cost')
        .optional()
        .isFloat({ min: 0 }).withMessage('El costo del tratamiento debe ser un número positivo'),
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial']).withMessage('El estado de pago debe ser: pending, paid o partial'),
    body('record_type')
        .optional()
        .isIn(['general', 'orthodontic', 'surgery']).withMessage('El tipo de registro debe ser: general, orthodontic o surgery'),
    body('created_by_info')
        .optional()
        .isObject().withMessage('created_by_info debe ser un objeto'),
    handleValidationErrors,
    validatePatientExists
];

/**
 * Validaciones para obtener un registro dental por ID
 */
const validateDentalRecordId = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

/**
 * Validaciones para actualizar el estado de pago de un registro dental
 */
const validateUpdatePaymentStatus = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
    body('payment_status')
        .notEmpty().withMessage('El estado de pago es requerido')
        .isIn(['pending', 'paid', 'partial']).withMessage('El estado de pago debe ser: pending, paid o partial'),
    handleValidationErrors
];

// :id en la ruta (GET/PUT/DELETE /api/patients/:id)
const validatePatientIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors
];

// ?email= en query (GET /api/patients/email)
const validatePatientEmailQuery = [
  query('email')
    .notEmpty().withMessage('email es requerido')
    .isEmail().withMessage('email debe ser válido'),
  handleValidationErrors
];

// POST /api/patients
const validateCreatePatient = [
  body('first_name').notEmpty().withMessage('first_name es requerido').isString(),
  body('last_name').notEmpty().withMessage('last_name es requerido').isString(),
  body('email').notEmpty().withMessage('email es requerido').isEmail(),
  body('birth_date')
    .notEmpty().withMessage('birth_date es requerido')
    .isISO8601().withMessage('birth_date debe ser ISO (YYYY-MM-DD)'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('insurance').optional().isString(),
  handleValidationErrors
];

// PUT /api/patients/:id
const validateUpdatePatient = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  body('first_name').optional().isString(),
  body('last_name').optional().isString(),
  body('email').optional().isEmail(),
  body('birth_date').optional().isISO8601().withMessage('birth_date debe ser ISO'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('insurance').optional().isString(),
  handleValidationErrors
];

// GET /api/patients/search?q=
const validateSearchQuery = [
  query('q')
    .notEmpty().withMessage('q es requerido')
    .isLength({ min: 2 }).withMessage('q debe tener al menos 2 caracteres'),
  handleValidationErrors
];

// POST /api/patients/:id/orthodontics/adjustments
const validateOrthodonticAdjustment = [
  body('description').notEmpty().withMessage('description es requerido').isString(),
  body('notes').optional().isString(),
  body('next_date').optional().isISO8601().withMessage('next_date debe ser ISO'),
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
    validateCreateDentalRecord,
    validateUpdateDentalRecord,
    validateDentalRecordId,
    validateUpdatePaymentStatus,
    validatePatientIdParam,
    validatePatientEmailQuery,
    validateCreatePatient,
    validateUpdatePatient,
    validateSearchQuery,
    validateOrthodonticAdjustment,
    handleValidationErrors
};

