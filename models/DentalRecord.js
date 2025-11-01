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
        this.collection = databaseConnection.getCollection('dentalrecords');
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
            treatment_notes: recordData.treatment_notes || '',
            diagnosis: recordData.diagnosis || '',
            treatment_plan: recordData.treatment_plan || '',
            file_path: recordData.file_path || '',
            next_appointment: recordData.next_appointment ? new Date(recordData.next_appointment) : null,
            treatment_cost: recordData.treatment_cost || 0,
            payment_status: recordData.payment_status || 'pending',
            created_at: new Date(),
            created_by_info: recordData.created_by_info,
            record_type: recordData.record_type || 'general'
        };
        const result = await this.collection.insertOne(record);
        return { ...record, _id: result.insertedId };
    }

    // Buscar registro por ID
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

    // Obtener todos los registros con paginación
    async findAll(page = 1, limit = 10) {
        await this.init();
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            this.collection.find({}).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments({})
        ]);
        return { records, total, page, limit };
    }

    // Actualizar datos del registro
    async update(recordId, updateData) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(recordId) },
            { $set: { ...updateData, updated_at: new Date() } }
        );
    }

    // Actualizar estado de pago
    async updatePaymentStatus(recordId, paymentStatus) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(recordId) },
            { $set: { payment_status: paymentStatus, updated_at: new Date() } }
        );
    }

    // Eliminar registro permanentemente
    async delete(recordId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(recordId) });
    }
}

module.exports = DentalRecord;