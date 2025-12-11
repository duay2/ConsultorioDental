/**
 * Controlador REST de Patients
 * CRUD + búsqueda + ortodoncia (usa modelo Patient.js y JWT)
 */

const Patient = require('../models/Patient');
const databaseConnection = require('../config/database');

const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

const allowed = ['first_name', 'last_name', 'email', 'phone', 'birth_date', 'address', 'medical_history', 'insurance', 'orthodontics'];

// GET /api/patients?page=&limit=
async function getAllPatients(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const page = +req.query.page || 1, limit = +req.query.limit || 10;
    const model = new Patient();
    const result = await model.findAll(page, limit);
    res.json({
      message: 'Pacientes obtenidos',
      data: result.patients,
      pagination: { total: result.total, page, limit }
    });
  } catch (e) { next(e); }
}

// GET /api/patients/:id
async function getPatientById(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const p = await model.findById(+req.params.id);
    if (!p) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json({ message: 'Paciente obtenido', data: p });
  } catch (e) { next(e); }
}

// GET /api/patients/email?email=
async function getPatientByEmail(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const p = await model.findByEmail(req.query.email);
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Paciente obtenido', data: p });
  } catch (e) { next(e); }
}

// GET /api/patients/search?q=
async function searchPatients(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const list = await model.searchByName(req.query.q || '');
    res.json({ message: 'Resultados', data: list });
  } catch (e) { next(e); }
}

// POST /api/patients
async function createPatient(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const data = pick(req.body, allowed);

    // Inicializar historial de citas vacío
    data.appointment_history = [];

    const created = await model.create(data);
    res.status(201).json({ message: 'Paciente creado', data: created });
  } catch (e) {
    if (String(e.message).includes('ya existe'))
      return res.status(409).json({ error: e.message });
    next(e);
  }
}

// PUT /api/patients/:id
async function updatePatient(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const id = +req.params.id;
    const model = new Patient();
    const exists = await model.findById(id);
    if (!exists) return res.status(404).json({ error: 'No encontrado' });

    if (req.body.email && req.body.email !== exists.email) {
      const dup = await model.findByEmail(req.body.email);
      if (dup) return res.status(409).json({ error: 'Email duplicado' });
    }

    const data = pick(req.body, allowed);

    const r = await model.update(id, data);
    if (!r.modifiedCount) return res.status(400).json({ error: 'No se actualizó' });

    const updated = await model.findById(id);
    
    // Actualizar el nombre del paciente en todas las citas relacionadas
    // Solo si se actualizó first_name o last_name
    if (data.first_name !== undefined || data.last_name !== undefined) {
      try {
        const Appointment = require('../models/Appointment');
        const appointmentModel = new Appointment();
        await appointmentModel.init();
        
        // Construir el nuevo nombre completo
        const newFirstName = data.first_name !== undefined ? data.first_name : updated.first_name;
        const newLastName = data.last_name !== undefined ? data.last_name : updated.last_name;
        const newFullName = `${newFirstName || ''} ${newLastName || ''}`.trim();
        
        // Actualizar todas las citas que tienen este paciente
        const appointmentsCollection = databaseConnection.getCollection('appointments');
        const updateResult = await appointmentsCollection.updateMany(
          { 'patient_info.id': id },
          { 
            $set: { 
              'patient_info.name': newFullName,
              'patient_info.first_name': newFirstName,
              'patient_info.last_name': newLastName,
              'patient_info.phone': updated.phone || exists.phone || ''
            } 
          }
        );
        
        console.log(`[PatientController] Actualizadas ${updateResult.modifiedCount} citas del paciente ${id} con nuevo nombre: ${newFullName}`);
      } catch (appointmentError) {
        // No fallar la actualización del paciente si hay error al actualizar citas
        console.error('[PatientController] Error al actualizar citas relacionadas:', appointmentError);
      }
    }
    
    res.json({ message: 'Paciente actualizado', data: updated });
  } catch (e) { next(e); }
}

// DELETE /api/patients/:id
async function deletePatient(req, res, next) {
  try {
    console.log(`[PatientController] Intentando eliminar paciente con ID: ${req.params.id}`);
    if (!databaseConnection.isConnectionActive()) {
      console.log('[PatientController] Conectando a la base de datos...');
      await databaseConnection.connect();
      console.log('[PatientController] Conexión a la base de datos exitosa.');
    }
    const model = new Patient();
    const r = await model.deletePatient(+req.params.id); // Usar deletePatient
    console.log('[PatientController] Resultado de la eliminación del modelo:', r);
    if (!r.deletedCount) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch (e) {
    console.error('[PatientController] Error al eliminar paciente:', e);
    next(e);
  }
}

// POST /api/patients/:id/orthodontics/adjustments
async function addOrthodonticAdjustment(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const r = await model.addOrthodonticAdjustment(+req.params.id, req.body);
    if (!r.modifiedCount) return res.status(400).json({ error: 'No se agregó ajuste' });
    const p = await model.findById(+req.params.id);
    res.status(201).json({ message: 'Ajuste agregado', data: p.orthodontics });
  } catch (e) { next(e); }
}

// POST /api/patients/:id/appointments-history
async function addAppointmentToPatientHistory(req, res, next) {
  try {
    if (!databaseConnection.isConnectionActive()) await databaseConnection.connect();
    const model = new Patient();
    const patientId = +req.params.id;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'ID de cita es requerido.' });
    }

    const r = await model.addAppointmentToHistory(patientId, appointmentId);
    if (!r.modifiedCount) {
      return res.status(400).json({ error: 'No se pudo agregar la cita al historial.' });
    }
    const updatedPatient = await model.findById(patientId);
    res.status(200).json({ message: 'Cita agregada al historial del paciente', data: updatedPatient.appointment_history });
  } catch (e) { next(e); }
}

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientByEmail,
  searchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  addOrthodonticAdjustment,
  addAppointmentToPatientHistory
};
