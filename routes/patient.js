/**
 * Rutas de Patients
 * Todas las rutas están protegidas por JWT (authenticateToken).
 * Prefijo: /api/patients
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/patientController');
const authenticateToken = require('../middlewares/auth');

const {
  validatePagination,
  validatePatientIdParam,
  validatePatientEmailQuery,
  validateCreatePatient,
  validateUpdatePatient,
  validateSearchQuery,
  validateOrthodonticAdjustment
} = require('../middlewares/validation');

// Aplicar auth a todas las rutas de este router
router.use(authenticateToken);

/**
 * GET /
 * Lista pacientes con paginación (?page,&limit)
 */
router.get('/', validatePagination, ctrl.getAllPatients);

/**
 * GET /search?q=
 * Búsqueda por nombre/apellido (regex, mínimo 2 chars).
 */
router.get('/search', validateSearchQuery, ctrl.searchPatients);

/**
 * GET /email?email=
 * Buscar por email exacto.
 */
router.get('/email', validatePatientEmailQuery, ctrl.getPatientByEmail);

/**
 * GET /:id
 * Obtener detalle por ID numérico.
 */
router.get('/:id', validatePatientIdParam, ctrl.getPatientById);

/**
 * POST /
 * Crear paciente.
 */
router.post('/', validateCreatePatient, ctrl.createPatient);

/**
 * PUT /:id
 * Actualizar paciente.
 */
router.put('/:id', validatePatientIdParam, validateUpdatePatient, ctrl.updatePatient);

/**
 * DELETE /:id
 * Eliminar paciente.
 */
router.delete('/:id', validatePatientIdParam, ctrl.deletePatient);

/**
 * POST /:id/orthodontics/adjustments
 * Agregar ajuste de ortodoncia.
 */
router.post(
  '/:id/orthodontics/adjustments',
  validatePatientIdParam,
  validateOrthodonticAdjustment,
  ctrl.addOrthodonticAdjustment
);

module.exports = router;
