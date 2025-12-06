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
        console.log('[Appointment Model] Datos recibidos para crear cita:', appointmentData);
        
        const nextId = await this.getNextId();
        
        // Asegurar que appointment_date se guarde correctamente
        let appointmentDate;
        if (typeof appointmentData.appointment_date === 'string') {
            // Si es string YYYY-MM-DD, extraer año, mes y día
            const parts = appointmentData.appointment_date.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                
                // Crear fecha en UTC para el día especificado (medianoche UTC)
                // IMPORTANTE: Usar Date.UTC para crear la fecha en UTC, no en hora local
                appointmentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                
                console.log(`[Appointment Model] ===== CREANDO CITA =====`);
                console.log(`[Appointment Model] Fecha recibida (string): "${appointmentData.appointment_date}"`);
                console.log(`[Appointment Model] Año: ${year}, Mes: ${month}, Día: ${day}`);
                console.log(`[Appointment Model] Fecha UTC creada: ${appointmentDate.toISOString()}`);
                
                // Verificar que la fecha creada corresponde al día correcto
                const verifyYear = appointmentDate.getUTCFullYear();
                const verifyMonth = appointmentDate.getUTCMonth() + 1;
                const verifyDay = appointmentDate.getUTCDate();
                console.log(`[Appointment Model] Verificación UTC: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                
                // También verificar en hora local (para debugging)
                const localYear = appointmentDate.getFullYear();
                const localMonth = appointmentDate.getMonth() + 1;
                const localDay = appointmentDate.getDate();
                console.log(`[Appointment Model] Verificación Local: ${localYear}-${localMonth}-${localDay}`);
                
                if (verifyYear !== year || verifyMonth !== month || verifyDay !== day) {
                    console.error(`[Appointment Model]  ERROR: La fecha UTC no coincide!`);
                    console.error(`[Appointment Model] Esperada: ${year}-${month}-${day}`);
                    console.error(`[Appointment Model] Obtenida UTC: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                    console.error(`[Appointment Model] Obtenida Local: ${localYear}-${localMonth}-${localDay}`);
                } else {
                    console.log(`[Appointment Model]  Fecha UTC correcta: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                }
            } else {
                throw new Error(`Formato de fecha inválido: ${appointmentData.appointment_date}. Debe ser YYYY-MM-DD`);
            }
        } else {
            appointmentDate = new Date(appointmentData.appointment_date);
            // Si ya es Date, normalizar a UTC medianoche
            if (appointmentDate instanceof Date && !isNaN(appointmentDate.getTime())) {
                const year = appointmentDate.getUTCFullYear();
                const month = appointmentDate.getUTCMonth();
                const day = appointmentDate.getUTCDate();
                appointmentDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
                console.log(`[Appointment Model] Fecha Date convertida a UTC medianoche: ${appointmentDate.toISOString()}`);
            }
        }
        
        const appointment = {
            id: nextId,
            appointment_date: appointmentDate,
            appointment_time: appointmentData.appointment_time,
            type: appointmentData.type,
            status: appointmentData.status || 'scheduled',
            notes: appointmentData.notes || '',
            created_at: new Date(),
            patient_info: appointmentData.patient_info,
            doctor_info: appointmentData.doctor_info,
            duration_minutes: appointmentData.duration_minutes || 15, // Por defecto 15 minutos
            precio_cita: appointmentData.precio_cita || 0, // Nuevo campo
            completed: appointmentData.completed || false // Nuevo campo
        };
        
        console.log(`[Appointment Model] Creando cita:`);
        console.log(`  - ID: ${appointment.id}`);
        console.log(`  - Fecha UTC: ${appointmentDate.toISOString()}`);
        console.log(`  - Fecha original recibida: ${appointmentData.appointment_date}`);
        console.log(`  - Hora: ${appointment.appointment_time}`);
        
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
        
        try {
            // Si date es un string (YYYY-MM-DD), extraer año, mes y día
            let year, month, day;
            if (typeof date === 'string') {
                const parts = date.split('-');
                if (parts.length !== 3) {
                    throw new Error(`Formato de fecha inválido: ${date}. Debe ser YYYY-MM-DD`);
                }
                year = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10);
                day = parseInt(parts[2], 10);
                
                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    throw new Error(`Fecha inválida: ${date}`);
                }
            } else {
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    throw new Error(`Fecha inválida: ${date}`);
                }
                year = dateObj.getFullYear();
                month = dateObj.getMonth() + 1;
                day = dateObj.getDate();
            }
            
            // Crear inicio del día en UTC (00:00:00 UTC)
            const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
            // Crear fin del día en UTC (23:59:59.999 UTC)
            const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
            
            // También crear string de fecha para buscar fechas guardadas como string
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            console.log(`[Appointment Model] Buscando citas para fecha: ${date} (${year}-${month}-${day})`);
            console.log(`[Appointment Model] Rango UTC: ${startOfDay.toISOString()} a ${endOfDay.toISOString()}`);
            console.log(`[Appointment Model] También buscando por string: ${dateStr}`);
            
            // Buscar citas que estén en el rango de fechas UTC O que tengan la fecha como string
            const appointments = await this.collection.find({
                $or: [
                    // Buscar por rango de fechas (para fechas guardadas como Date)
                    { appointment_date: { $gte: startOfDay, $lte: endOfDay } },
                    // Buscar por fecha como string (para fechas guardadas como string)
                    { appointment_date: dateStr },
                    // Buscar por fecha que empiece con el string (para fechas ISO que incluyen la fecha)
                    { appointment_date: { $regex: `^${dateStr}`, $options: 'i' } }
                ]
            }).sort({ appointment_time: 1 }).toArray();
            
            console.log(`[Appointment Model] Citas encontradas: ${appointments.length}`);
            if (appointments.length > 0) {
                appointments.forEach((apt, idx) => {
                    const aptDate = apt.appointment_date instanceof Date 
                        ? apt.appointment_date.toISOString() 
                        : apt.appointment_date;
                    console.log(`[Appointment Model] Cita ${idx + 1}: id=${apt.id}, fecha=${aptDate}, time=${apt.appointment_time}`);
                });
            } else {
                // Debug: ver todas las citas para entender el formato
                const allAppointments = await this.collection.find({}).limit(10).toArray();
                console.log(`[Appointment Model] Ejemplo de citas en BD (primeras 10):`);
                allAppointments.forEach((apt, idx) => {
                    const aptDate = apt.appointment_date instanceof Date 
                        ? apt.appointment_date.toISOString() 
                        : apt.appointment_date;
                    const aptDateType = apt.appointment_date instanceof Date ? 'Date' : typeof apt.appointment_date;
                    console.log(`  Cita ${idx + 1}: id=${apt.id}, fecha=${aptDate} (tipo: ${aptDateType}), time=${apt.appointment_time}`);
                });
            }
            
            return appointments;
        } catch (error) {
            console.error(`[Appointment Model] Error en findByDate para fecha ${date}:`, error);
            throw error;
        }
    }

    // Buscar citas por paciente
    async findByPatientId(patientId) {
        await this.init();
        console.log(`[Appointment Model] Buscando citas para patient_info.id: ${patientId}`);
        const appointments = await this.collection.find(
            { 'patient_info.id': parseInt(patientId) },
            { projection: { type: 1, appointment_date: 1, notes: 1, precio_cita: 1, status: 1, _id: 0 } }
        ).sort({ appointment_date: -1 }).toArray();
        console.log(`[Appointment Model] Encontradas ${appointments.length} citas para paciente ${patientId}.`)
        if (appointments.length === 0) {
            console.log('[Appointment Model] No se encontraron citas. Buscando un ejemplo de documentos en la colección...');
            const sampleDocs = await this.collection.find({}).limit(5).toArray();
            if (sampleDocs.length > 0) {
                console.log('[Appointment Model] Primeros 5 documentos de la colección:');
                sampleDocs.forEach((doc, index) => {
                    console.log(`  [${index}] id: ${doc.id}, patient_info.id: ${doc.patient_info?.id}, patient_info.name: ${doc.patient_info?.name}, appointment_date: ${doc.appointment_date}`);
                });
            } else {
                console.log('[Appointment Model] La colección de citas está vacía.');
            }
        }
        return appointments;
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
        
        // Preparar datos de actualización
        const updateFields = { ...updateData };
        
        // Convertir appointment_date a Date si es string
        if (updateFields.appointment_date && typeof updateFields.appointment_date === 'string') {
            const parts = updateFields.appointment_date.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const day = parseInt(parts[2], 10);
                
                // Crear fecha en UTC para el día especificado (medianoche UTC)
                updateFields.appointment_date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                
                console.log(`[Appointment Model] ===== ACTUALIZANDO CITA =====`);
                console.log(`[Appointment Model] Fecha recibida (string): "${updateFields.appointment_date}"`);
                console.log(`[Appointment Model] Año: ${year}, Mes: ${month}, Día: ${day}`);
                console.log(`[Appointment Model] Fecha UTC creada: ${updateFields.appointment_date.toISOString()}`);
                
                // Verificar que la fecha creada corresponde al día correcto
                const verifyYear = updateFields.appointment_date.getUTCFullYear();
                const verifyMonth = updateFields.appointment_date.getUTCMonth() + 1;
                const verifyDay = updateFields.appointment_date.getUTCDate();
                console.log(`[Appointment Model] Verificación UTC: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                
                if (verifyYear !== year || verifyMonth !== month || verifyDay !== day) {
                    console.error(`[Appointment Model]  ERROR: La fecha UTC no coincide!`);
                    console.error(`[Appointment Model] Esperada: ${year}-${month}-${day}`);
                    console.error(`[Appointment Model] Obtenida UTC: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                } else {
                    console.log(`[Appointment Model]  Fecha UTC correcta: ${verifyYear}-${verifyMonth}-${verifyDay}`);
                }
            } else {
                throw new Error(`Formato de fecha inválido: ${updateFields.appointment_date}. Debe ser YYYY-MM-DD`);
            }
        }
        
        // Asegurar que appointment_time se guarde correctamente
        if (updateFields.appointment_time) {
            // Validar formato de hora (HH:MM)
            const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timePattern.test(updateFields.appointment_time)) {
                console.warn(`[Appointment Model] Formato de hora inválido: ${updateFields.appointment_time}, normalizando...`);
                // Intentar normalizar el formato
                const parts = updateFields.appointment_time.replace(/[^0-9]/g, '');
                if (parts.length >= 4) {
                    updateFields.appointment_time = `${parts.substring(0, 2)}:${parts.substring(2, 4)}`;
                }
            }
            console.log(`[Appointment Model] Actualizando hora a: ${updateFields.appointment_time}`);
        }
        
        updateFields.updated_at = new Date();
        
        console.log(`[Appointment Model] Datos de actualización completos:`, JSON.stringify(updateFields, null, 2));
        
        const result = await this.collection.updateOne(
            { id: parseInt(appointmentId) },
            { $set: updateFields }
        );
        
        console.log(`[Appointment Model] Cita ${appointmentId} actualizada:`, result.modifiedCount > 0 ? 'éxito' : 'sin cambios');
        console.log(`[Appointment Model] Resultado updateOne:`, {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            acknowledged: result.acknowledged
        });
        
        // Verificar que se actualizó correctamente
        if (result.modifiedCount > 0) {
            const updated = await this.findById(appointmentId);
            console.log(`[Appointment Model] Cita actualizada verificada:`, {
                id: updated?.id,
                date: updated?.appointment_date,
                time: updated?.appointment_time
            });
        }
        
        return result;
    }

    // Actualizar estado de la cita
    async updateStatus(appointmentId, status) {
        await this.init();
        
        const updateFields = { status: status, updated_at: new Date() };
        
        // Si el estado es 'completada', marcar la cita como completada
        if (status === 'completada') {
            updateFields.completed = true;
        } else {
            updateFields.completed = false;
        }
        
        return await this.collection.updateOne(
            { id: parseInt(appointmentId) },
            { $set: updateFields }
        );
    }

    // Eliminar cita permanentemente
    async delete(appointmentId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(appointmentId) });
    }
}

module.exports = Appointment;