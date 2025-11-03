const DentalRecord = require('../models/DentalRecord');
const Patient = require('../models/Patient');
const databaseConnection = require('../config/database');

/**
 * Obtener todos los registros dentales (sin paginación)
 * GET /api/dentalrecords
 */
const getAllDentalRecords = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const dentalRecordModel = new DentalRecord();
        const result = await dentalRecordModel.findAll();

        res.status(200).json({
            message: 'Registros dentales obtenidos exitosamente',
            data: result.records,
            total: result.total
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un registro dental por ID
 * GET /api/dentalrecords/:id
 */
const getDentalRecordById = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const recordId = parseInt(req.params.id);
        const dentalRecordModel = new DentalRecord();
        const record = await dentalRecordModel.findById(recordId);

        if (!record) {
            return res.status(404).json({
                error: 'Registro dental no encontrado',
                message: `No se encontró un registro dental con ID ${recordId}`
            });
        }

        res.status(200).json({
            message: 'Registro dental obtenido exitosamente',
            data: record
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear un nuevo registro dental
 * POST /api/dentalrecords
 */
const createDentalRecord = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        // Verificar que el paciente existe
        if (req.body.patient_id) {
            const patientModel = new Patient();
            const patient = await patientModel.findById(req.body.patient_id);
            
            if (!patient) {
                return res.status(400).json({
                    error: 'Paciente no encontrado',
                    message: `No existe un paciente con ID ${req.body.patient_id}`
                });
            }
        }

        const dentalRecordModel = new DentalRecord();
        const record = await dentalRecordModel.create(req.body);

        res.status(201).json({
            message: 'Registro dental creado exitosamente',
            data: record
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un registro dental
 * PUT /api/dentalrecords/:id
 */
const updateDentalRecord = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const recordId = parseInt(req.params.id);
        const dentalRecordModel = new DentalRecord();

        // Verificar que el registro existe
        const existingRecord = await dentalRecordModel.findById(recordId);
        if (!existingRecord) {
            return res.status(404).json({
                error: 'Registro dental no encontrado',
                message: `No se encontró un registro dental con ID ${recordId}`
            });
        }

        // Verificar que el paciente existe (si se está actualizando el patient_id)
        if (req.body.patient_id) {
            const patientModel = new Patient();
            const patient = await patientModel.findById(req.body.patient_id);
            
            if (!patient) {
                return res.status(400).json({
                    error: 'Paciente no encontrado',
                    message: `No existe un paciente con ID ${req.body.patient_id}`
                });
            }
        }

        // Actualizar el registro
        const result = await dentalRecordModel.update(recordId, req.body);

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo actualizar el registro dental',
                message: 'El registro dental no fue modificado'
            });
        }

        // Obtener el registro actualizado
        const updatedRecord = await dentalRecordModel.findById(recordId);

        res.status(200).json({
            message: 'Registro dental actualizado exitosamente',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un registro dental
 * DELETE /api/dentalrecords/:id
 */
const deleteDentalRecord = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const recordId = parseInt(req.params.id);
        const dentalRecordModel = new DentalRecord();

        // Verificar que el registro existe
        const existingRecord = await dentalRecordModel.findById(recordId);
        if (!existingRecord) {
            return res.status(404).json({
                error: 'Registro dental no encontrado',
                message: `No se encontró un registro dental con ID ${recordId}`
            });
        }

        // Eliminar el registro
        const result = await dentalRecordModel.delete(recordId);

        if (result.deletedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo eliminar el registro dental',
                message: 'El registro dental no fue eliminado'
            });
        }

        res.status(200).json({
            message: 'Registro dental eliminado exitosamente',
            deleted_id: recordId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener registros dentales por paciente
 * GET /api/dentalrecords/patient?patient_id=1
 */
const getDentalRecordsByPatient = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const patientId = parseInt(req.query.patient_id);
        const dentalRecordModel = new DentalRecord();
        const records = await dentalRecordModel.findByPatient(patientId);

        res.status(200).json({
            message: 'Registros dentales obtenidos exitosamente',
            patient_id: patientId,
            count: records.length,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar el estado de pago de un registro dental
 * PATCH /api/dentalrecords/:id/payment-status
 */
const updatePaymentStatus = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const recordId = parseInt(req.params.id);
        const { payment_status } = req.body;
        const dentalRecordModel = new DentalRecord();

        // Verificar que el registro existe
        const existingRecord = await dentalRecordModel.findById(recordId);
        if (!existingRecord) {
            return res.status(404).json({
                error: 'Registro dental no encontrado',
                message: `No se encontró un registro dental con ID ${recordId}`
            });
        }

        // Actualizar el estado de pago
        const result = await dentalRecordModel.updatePaymentStatus(recordId, payment_status);

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo actualizar el estado de pago',
                message: 'El estado de pago no fue modificado'
            });
        }

        // Obtener el registro actualizado
        const updatedRecord = await dentalRecordModel.findById(recordId);

        res.status(200).json({
            message: 'Estado de pago actualizado exitosamente',
            data: updatedRecord
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDentalRecords,
    getDentalRecordById,
    createDentalRecord,
    updateDentalRecord,
    deleteDentalRecord,
    getDentalRecordsByPatient,
    updatePaymentStatus
};
