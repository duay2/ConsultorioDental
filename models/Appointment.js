const { ObjectId } = require('mongodb');
const databaseConnection = require('../config/database');

/**
 * Clase Appointment - Operaciones básicas de citas
 */
class Appointment {
    constructor() {
        this.collection = null;
    }

    async init() {
        this.collection = databaseConnection.getCollection('appointments');
    }

    // Obtener el siguiente ID numérico
    async getNextId() {
        // Buscar la última cita con ID numérico
        const lastAppointment = await this.collection.findOne({ id: { $exists: true, $type: "number" } }, { sort: { id: -1 } });
        
        if (lastAppointment) {
            return lastAppointment.id + 1;
        }
        
        // Si no hay citas con ID numérico, contar las existentes y empezar desde ahí
        const totalAppointments = await this.collection.countDocuments({});
        return totalAppointments + 1;
    }

    // Crear una nueva cita
    async create(appointmentData) {
        await this.init();
        const nextId = await this.getNextId();
        const appointment = {
            id: nextId,
            appointment_date: new Date(appointmentData.appointment_date),
            appointment_time: appointmentData.appointment_time,
            type: appointmentData.type,
            status: appointmentData.status || 'scheduled',
            notes: appointmentData.notes || '',
            created_at: new Date(),
            patient_info: appointmentData.patient_info,
            doctor_info: appointmentData.doctor_info,
            duration_minutes: appointmentData.duration_minutes || 30
        };
        const result = await this.collection.insertOne(appointment);
        return { ...appointment, _id: result.insertedId };
    }

    // Buscar cita por ID
    async findById(appointmentId) {
        await this.init();
        return await this.collection.findOne({ id: parseInt(appointmentId) });
    }

    // Buscar citas por fecha
    async findByDate(date) {
        await this.init();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await this.collection.find({
            appointment_date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ appointment_time: 1 }).toArray();
    }

    // Buscar citas por paciente
    async findByPatient(patientId) {
        await this.init();
        return await this.collection.find({
            'patient_info.id': parseInt(patientId)
        }).sort({ appointment_date: -1 }).toArray();
    }

    // Obtener todas las citas con paginación
    async findAll(page = 1, limit = 10) {
        await this.init();
        const skip = (page - 1) * limit;
        const [appointments, total] = await Promise.all([
            this.collection.find({}).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments({})
        ]);
        return { appointments, total, page, limit };
    }

    // Actualizar datos de la cita
    async update(appointmentId, updateData) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(appointmentId) },
            { $set: { ...updateData, updated_at: new Date() } }
        );
    }

    // Actualizar estado de la cita
    async updateStatus(appointmentId, status) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(appointmentId) },
            { $set: { status: status, updated_at: new Date() } }
        );
    }

    // Eliminar cita permanentemente
    async delete(appointmentId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(appointmentId) });
    }
}

module.exports = Appointment;