const express = require('express');
const router = express.Router();
const dentalRecordsController = require('../controllers/dental-recordsController');
const authenticateToken = require('../middlewares/auth');
const {
    validateCreateDentalRecord,
    validateUpdateDentalRecord,
    validateDentalRecordId,
    validatePatientId
} = require('../middlewares/validation');


// Ruta para obtener todos los registros dentales 
// GET /api/dental-records
router.get('/',authenticateToken,dentalRecordsController.getAllDentalRecords);

// Ruta para obtener registros dentales por paciente
// GET /api/dental-records/patient?patient_id=1
router.get('/patient',authenticateToken,validatePatientId,dentalRecordsController.getDentalRecordsByPatient);

// Ruta para obtener un registro dental por ID
// GET /api/dental-records/:id
router.get('/:id', authenticateToken,validateDentalRecordId,dentalRecordsController.getDentalRecordById);

// Ruta para crear un nuevo registro dental
// POST /api/dental-records
router.post('/',authenticateToken,validateCreateDentalRecord,dentalRecordsController.createDentalRecord
);

// Ruta para actualizar un registro dental completo
// PUT /api/dental-records/:id
router.put('/:id',authenticateToken,validateUpdateDentalRecord,dentalRecordsController.updateDentalRecord);

// Ruta para actualizar varios campos
// PATCH /api/dental-records/:id
router.patch('/:id',authenticateToken,validateUpdateDentalRecord,dentalRecordsController.updateDentalRecord);

// Ruta para eliminar un registro dental
// DELETE /api/dental-records/:id
router.delete('/:id',authenticateToken,validateDentalRecordId,dentalRecordsController.deleteDentalRecord);

module.exports = router;
