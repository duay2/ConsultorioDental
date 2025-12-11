/**
 * dental-records-service
 * Servicio para manejar operaciones de registros dentales con la API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class DentalRecordsService {
    async getAuthHeaders() {
        // Usar auth-service para obtener el token
        const authService = await import('./auth-service.js');
        const token = authService.default.getToken();

        if (!token) {
            throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async getAllDentalRecords() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/dental-records`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener registros dentales');
            }

            const result = await response.json();
            const records = result.data || [];

            // Obtener IDs únicos de pacientes
            const patientIds = [...new Set(records.map(r => r.patient_id).filter(id => id))];

            // Obtener información de pacientes si hay IDs
            let patientMap = new Map();
            if (patientIds.length > 0) {
                try {
                    const patientService = (await import('./patient-service.js')).default;
                    const patients = await patientService.getAllPatients(1, 100); // Obtener pacientes (máximo 100)

                    // Crear mapa de pacientes
                    patients.forEach(patient => {
                        patientMap.set(patient.id, patient);
                    });
                } catch (error) {
                    // Error obteniendo pacientes
                }
            }

            // Procesar registros con información de pacientes
            return records.map(record => {
                // Si el backend ya incluye patient_info (por ejemplo, cuando es secretaria y oculta el nombre),
                // respetar esos datos. Solo agregar información del paciente si no existe.
                let patientInfo = record.patient_info;
                
                if (!patientInfo && record.patient_id) {
                    const patient = patientMap.get(record.patient_id);
                    patientInfo = patient ? {
                        id: patient.id,
                        name: patient.name,
                        first_name: patient.first_name,
                        last_name: patient.last_name,
                        email: patient.email
                    } : { name: 'Paciente desconocido' };
                }

                return {
                    ...record,
                    // Crear campos calculados para el frontend
                    treatment_type: record.record_type || 'general',
                    cost: record.treatment_cost || 0,
                    date: record.created_at,
                    notes: record.treatment_notes || '',
                    // Información del paciente (respetar la que viene del backend)
                    patient_info: patientInfo || { name: 'Paciente desconocido' }
                };
            });
        } catch (error) {
            throw error;
        }
    }

    async getDentalRecordById(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/dental-records/${id}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener el registro dental');
            }

            const result = await response.json();
            const record = result.data;

            // Si el backend ya incluye patient_info (por ejemplo, cuando es secretaria y oculta el nombre),
            // respetar esos datos. Solo obtener información del paciente si no existe.
            let patientInfo = record.patient_info;
            
            if (!patientInfo && record.patient_id) {
                try {
                    const patientService = (await import('./patient-service.js')).default;
                    const patient = await patientService.getPatientById(record.patient_id);
                    if (patient) {
                        patientInfo = {
                            id: patient.id,
                            name: patient.name,
                            first_name: patient.first_name,
                            last_name: patient.last_name,
                            email: patient.email
                        };
                    } else {
                        patientInfo = { name: 'Paciente desconocido' };
                    }
                } catch (error) {
                    // Error obteniendo paciente individual
                    patientInfo = { name: 'Paciente desconocido' };
                }
            }

            return {
                ...record,
                patient_info: patientInfo || { name: 'Paciente desconocido' }
            };
        } catch (error) {
            throw error;
        }
    }

    async createDentalRecord(recordData) {
        try {
            const headers = await this.getAuthHeaders();

            const response = await fetch(`${API_BASE_URL}/dental-records`, {
                method: 'POST',
                headers,
                body: JSON.stringify(recordData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el registro dental');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async updateDentalRecord(id, recordData) {
        try {
            const headers = await this.getAuthHeaders();
            const recordId = parseInt(id);

            const response = await fetch(`${API_BASE_URL}/dental-records/${recordId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(recordData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Error al actualizar el registro dental');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteDentalRecord(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/dental-records/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar el registro dental');
            }

            // El backend debería devolver 204 (No Content) en una eliminación exitosa
            if (response.status === 204) {
                return { success: true, message: 'Registro dental eliminado exitosamente' };
            }

            // Si hay contenido, intentar parsearlo (caso poco probable para DELETE)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return { success: true, message: 'Registro dental eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }

    async getDentalRecordsByPatient(patientId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/dental-records/patient?patient_id=${patientId}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener registros del paciente');
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            throw error;
        }
    }
}

export default new DentalRecordsService();
