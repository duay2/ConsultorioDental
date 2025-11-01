const { ObjectId } = require('mongodb');
const databaseConnection = require('../config/database');

/**
 * Clase Patient - Operaciones básicas de pacientes
 */
class Patient {
    constructor() {
        this.collection = null;
    }

    async init() {
        this.collection = databaseConnection.getCollection('patients');
    }

    // Obtener el siguiente ID numérico
    async getNextId() {
        // Buscar el último paciente con ID numérico
        const lastPatient = await this.collection.findOne({ id: { $exists: true, $type: "number" } }, { sort: { id: -1 } });
        
        if (lastPatient) {
            return lastPatient.id + 1;
        }
        
        // Si no hay pacientes con ID numérico, contar los existentes y empezar desde ahí
        const totalPatients = await this.collection.countDocuments({});
        return totalPatients + 1;
    }

    // Crear un nuevo paciente (evita duplicados)
    async create(patientData) {
        await this.init();
        
        // Verificar si el paciente ya existe
        const existingPatient = await this.findByEmail(patientData.email);
        if (existingPatient) {
            throw new Error(`Paciente con email ${patientData.email} ya existe`);
        }
        
        // Obtener el siguiente ID numérico
        const nextId = await this.getNextId();
        
        const patient = {
            id: nextId,
            first_name: patientData.first_name,
            last_name: patientData.last_name,
            email: patientData.email,
            phone: patientData.phone,
            birth_date: new Date(patientData.birth_date),
            address: patientData.address,
            insurance: patientData.insurance,
            created_at: new Date(),
            orthodontics: patientData.orthodontics || null,
            dental_records_refs: []
        };
        const result = await this.collection.insertOne(patient);
        return { ...patient, _id: result.insertedId };
    }

    // Buscar paciente por ID
    async findById(patientId) {
        await this.init();
        return await this.collection.findOne({ id: parseInt(patientId) });
    }

    // Buscar paciente por email
    async findByEmail(email) {
        await this.init();
        return await this.collection.findOne({ email: email });
    }

    // Obtener todos los pacientes con paginación
    async findAll(page = 1, limit = 10) {
        await this.init();
        const skip = (page - 1) * limit;
        const [patients, total] = await Promise.all([
            this.collection.find({}).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments({})
        ]);
        return { patients, total, page, limit };
    }

    // Actualizar datos del paciente
    async update(patientId, updateData) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(patientId) },
            { $set: { ...updateData, updated_at: new Date() } }
        );
    }

    // Buscar pacientes por nombre o apellido
    async searchByName(searchTerm) {
        await this.init();
        const regex = new RegExp(searchTerm, 'i');
        return await this.collection.find({
            $or: [
                { first_name: regex },
                { last_name: regex }
            ]
        }).toArray();
    }

    // Agregar ajuste de ortodoncia al paciente
    async addOrthodonticAdjustment(patientId, adjustment) {
        await this.init();
        const adjustmentData = {
            ...adjustment,
            _id: new ObjectId(),
            created_at: new Date()
        };

        // Verificar si el paciente tiene información de ortodoncia
        const patient = await this.findById(patientId);
        if (!patient.orthodontics) {
            // Inicializar estructura de ortodoncia si no existe
            await this.collection.updateOne(
                { id: parseInt(patientId) },
                { 
                    $set: { 
                        orthodontics: {
                            status: 'active',
                            start_date: new Date(),
                            adjustments: []
                        },
                        updated_at: new Date()
                    }
                }
            );
        }

        return await this.collection.updateOne(
            { id: parseInt(patientId) },
            { 
                $push: { 
                    'orthodontics.adjustments': adjustmentData 
                },
                $set: { 
                    updated_at: new Date()
                }
            }
        );
    }

    // Eliminar paciente permanentemente
    async delete(patientId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(patientId) });
    }
}

module.exports = Patient;