/**
 * patient-service
 * Servicio para manejar operaciones de pacientes con la API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class PatientService {
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

    async getAllPatients(page = 1, limit = 100) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/patients?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener pacientes');
            }

            const result = await response.json();
            // Combinar first_name y last_name en un campo name para el frontend
            return (result.data || []).map(patient => ({
                ...patient,
                name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
            }));
        } catch (error) {
            throw error;
        }
    }

    async getPatientById(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener el paciente');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async createPatient(patientData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers,
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el paciente');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async updatePatient(id, patientData) {
        try {
            const headers = await this.getAuthHeaders();
            const patientId = parseInt(id);

            const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || error.error || 'Error al actualizar el paciente');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            throw error;
        }
    }

    async deletePatient(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar el paciente');
            }

            // El backend debería devolver 204 (No Content) en una eliminación exitosa
            if (response.status === 204) {
                return { success: true, message: 'Paciente eliminado exitosamente' };
            }

            // Si hay contenido, intentar parsearlo (caso poco probable para DELETE)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return { success: true, message: 'Paciente eliminado exitosamente' };
        } catch (error) {
            throw error;
        }
    }

    async searchPatients(searchTerm) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/patients/search?q=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al buscar pacientes');
            }

            const result = await response.json();
            // Combinar first_name y last_name en un campo name para el frontend
            return (result.data || []).map(patient => ({
                ...patient,
                name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
            }));
        } catch (error) {
            throw error;
        }
    }
}

export default new PatientService();

