const { ObjectId } = require('mongodb');
const databaseConnection = require('../config/database');

/**
 * Clase DentalRecord - Operaciones básicas de registros dentales
 */
class DentalRecord {
    constructor() {
        this.collection = null;
    }

    async init() {
        this.collection = databaseConnection.getCollection('dental-records');
    }

    // Obtener el siguiente ID numérico
    async getNextId() {
        // Buscar el último registro con ID numérico
        const lastRecord = await this.collection.findOne({ id: { $exists: true, $type: "number" } }, { sort: { id: -1 } });
        
        if (lastRecord) {
            return lastRecord.id + 1;
        }
        
        // Si no hay registros con ID numérico, contar los existentes y empezar desde ahí
        const totalRecords = await this.collection.countDocuments({});
        return totalRecords + 1;
    }

    // Crear un nuevo registro dental
    async create(recordData) {
        await this.init();
        const nextId = await this.getNextId();
        
        const record = {
            id: nextId,
            patient_id: parseInt(recordData.patient_id),
            description: recordData.description,
            diagnosis: recordData.diagnosis,
            treatment_plan: recordData.treatment_plan,
            treatment_notes: recordData.treatment_notes || '',
            file_path: recordData.file_path || '',
            next_appointment: recordData.next_appointment ? new Date(recordData.next_appointment) : null,
            treatment_cost: parseFloat(recordData.treatment_cost) || 0,
            payment_status: recordData.payment_status || 'pending',
            record_type: recordData.record_type || 'general',
            created_by_info: recordData.created_by_info || { id: 'SYSTEM', name: 'Sistema' },
            created_at: new Date()
        };
        
        const result = await this.collection.insertOne(record);
        return { ...record, _id: result.insertedId };
    }

    // Buscar registro dental por ID
    async findById(recordId) {
        await this.init();
        return await this.collection.findOne({ id: parseInt(recordId) });
    }

    // Buscar registros por paciente
    async findByPatient(patientId) {
        await this.init();
        return await this.collection.find({
            patient_id: parseInt(patientId)
        }).sort({ created_at: -1 }).toArray();
    }

    // Buscar registros por tipo
    async findByType(recordType) {
        await this.init();
        return await this.collection.find({
            record_type: recordType
        }).sort({ created_at: -1 }).toArray();
    }

    // Obtener todos los registros (sin paginación) con información del paciente
    async findAll() {
        await this.init();
        const records = await this.collection.aggregate([
            {
                $lookup: {
                    from: 'patients',
                    localField: 'patient_id',
                    foreignField: 'id',
                    as: 'patient_info'
                }
            },
            {
                $unwind: {
                    path: '$patient_info',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { created_at: -1 }
            }
        ]).toArray();

        const total = records.length;
        return { records, total };
    }

    // Actualizar datos del registro dental
    async update(recordId, updateData) {
        await this.init();
        
        // Preparar datos de actualización
        const updateFields = {};
        
        if (updateData.patient_id !== undefined) {
            updateFields.patient_id = parseInt(updateData.patient_id);
        }
        if (updateData.description !== undefined) {
            updateFields.description = updateData.description;
        }
        if (updateData.diagnosis !== undefined) {
            updateFields.diagnosis = updateData.diagnosis;
        }
        if (updateData.treatment_plan !== undefined) {
            updateFields.treatment_plan = updateData.treatment_plan;
        }
        if (updateData.treatment_notes !== undefined) {
            updateFields.treatment_notes = updateData.treatment_notes;
        }
        if (updateData.file_path !== undefined) {
            updateFields.file_path = updateData.file_path;
        }
        if (updateData.next_appointment !== undefined) {
            updateFields.next_appointment = updateData.next_appointment ? new Date(updateData.next_appointment) : null;
        }
        if (updateData.treatment_cost !== undefined) {
            updateFields.treatment_cost = parseFloat(updateData.treatment_cost);
        }
        if (updateData.payment_status !== undefined) {
            updateFields.payment_status = updateData.payment_status;
        }
        if (updateData.record_type !== undefined) {
            updateFields.record_type = updateData.record_type;
        }
        if (updateData.created_by_info !== undefined) {
            updateFields.created_by_info = updateData.created_by_info;
        }
        
        updateFields.updated_at = new Date();
        
        return await this.collection.updateOne(
            { id: parseInt(recordId) },
            { $set: updateFields }
        );
    }

    // Actualizar estado de pago del registro dental
    async updatePaymentStatus(recordId, paymentStatus) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(recordId) },
            { $set: { payment_status: paymentStatus, updated_at: new Date() } }
        );
    }

    // Eliminar registro dental permanentemente
    async delete(recordId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(recordId) });
    }
}

module.exports = DentalRecord;
