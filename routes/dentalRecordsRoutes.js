const express = require('express');
const router = express.Router();
const dentalRecordsController = require('../controllers/dentalRecordsController');
const authenticateToken = require('../middlewares/auth');
const {
    validateCreateDentalRecord,
    validateUpdateDentalRecord,
    validateDentalRecordId,
    validatePatientId
} = require('../middlewares/validation');


// Ruta para obtener todos los registros dentales 
// GET /api/dentalrecords
router.get('/',authenticateToken,dentalRecordsController.getAllDentalRecords);

// Ruta para obtener registros dentales por paciente
// GET /api/dentalrecords/patient?patient_id=1
router.get('/patient',authenticateToken,validatePatientId,dentalRecordsController.getDentalRecordsByPatient);

// Ruta para obtener un registro dental por ID
// GET /api/dentalrecords/:id
router.get('/:id', authenticateToken,validateDentalRecordId,dentalRecordsController.getDentalRecordById);

// Ruta para crear un nuevo registro dental
// POST /api/dentalrecords
router.post('/',authenticateToken,validateCreateDentalRecord,dentalRecordsController.createDentalRecord
);

// Ruta para actualizar un registro dental completo
// PUT /api/dentalrecords/:id
router.put('/:id',authenticateToken,validateUpdateDentalRecord,dentalRecordsController.updateDentalRecord);

// Ruta para actualizar varios campos
// PATCH /api/dentalrecords/:id
router.patch('/:id',authenticateToken,validateUpdateDentalRecord,dentalRecordsController.updateDentalRecord);

// Ruta para eliminar un registro dental
// DELETE /api/dentalrecords/:id
router.delete('/:id',authenticateToken,validateDentalRecordId,dentalRecordsController.deleteDentalRecord);

module.exports = router;
