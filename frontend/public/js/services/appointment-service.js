/**
 * Servicio para manejar las operaciones de citas con la API
 */
const API_BASE_URL = 'http://localhost:3000/api';

class AppointmentService {
    constructor() {
        this.token = this.getToken();
    }

    getToken() {
        return localStorage.getItem('dentalflow_token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Obtener token actualizado en cada petición
        const currentToken = this.getToken();
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        return headers;
    }

    /**
     * Obtener citas por fecha
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Array>} Lista de citas
     */
    async getAppointmentsByDate(date) {
        try {
            const url = `${API_BASE_URL}/appointments/date?date=${date}`;
            console.log('[AppointmentService] Solicitando citas desde:', url);
            console.log('[AppointmentService] Headers:', this.getHeaders());
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            console.log('[AppointmentService] Response status:', response.status);
            console.log('[AppointmentService] Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AppointmentService] Error response:', errorText);
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[AppointmentService] Response data completa:', data);
            console.log('[AppointmentService] Citas en data.data:', data.data);
            console.log('[AppointmentService] Número de citas:', data.data?.length || 0);
            
            return data.data || [];
        } catch (error) {
            console.error('[AppointmentService] Error al obtener citas por fecha:', error);
            throw error;
        }
    }

    /**
 * Obtiene las citas programadas para un paciente específico.
 * @param {number} patientId - El ID numérico del paciente.
 */
async getAppointmentsByPatientId(patientId) {
    try {
        const response = await fetch(`/api/appointments/patient?patient_id=${patientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener las citas del paciente');
        }

        const data = await response.json();
        return data.data; // Retorna el array de citas
    } catch (error) {
        console.error("Error en getAppointmentsByPatientId:", error);
        throw error;
    }
}

    /**
     * Obtener una cita por ID
     * @param {number} appointmentId - ID de la cita
     * @returns {Promise<Object>} Datos de la cita
     */
    async getAppointmentById(appointmentId) {
        try {
            const url = `${API_BASE_URL}/appointments/${appointmentId}`;
            console.log(`[AppointmentService] Obteniendo cita ${appointmentId} desde:`, url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AppointmentService] Error al obtener cita:', errorText);
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`[AppointmentService] Cita obtenida:`, data);
            return data.data;
        } catch (error) {
            console.error('Error al obtener cita:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las citas
     * @param {number} page - Número de página
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Object>} Objeto con citas y paginación
     */
    async getAllAppointments(page = 1, limit = 100) {
        try {
            const url = `${API_BASE_URL}/appointments?page=${page}&limit=${limit}`;
            console.log('[AppointmentService] Obteniendo todas las citas desde:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AppointmentService] Error al obtener todas las citas:', errorText);
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('[AppointmentService] Todas las citas obtenidas:', data);
            return data;
        } catch (error) {
            console.error('Error al obtener citas:', error);
            throw error;
        }
    }

    /**
     * Actualizar una cita (para reagendar)
     * @param {number} appointmentId - ID de la cita
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Object>} Cita actualizada
     */
    async updateAppointment(appointmentId, updateData) {
        try {
            const url = `${API_BASE_URL}/appointments/${appointmentId}`;
            console.log(`[AppointmentService] Actualizando cita ${appointmentId} en:`, url);
            console.log(`[AppointmentService] Datos de actualización:`, updateData);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updateData)
            });

            console.log(`[AppointmentService] Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AppointmentService] Error response:', errorText);
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`[AppointmentService] Cita actualizada exitosamente:`, data);
            return data.data;
        } catch (error) {
            console.error('Error al actualizar cita:', error);
            throw error;
        }
    }

    /**
     * Crear una nueva cita
     * @param {Object} appointmentData - Datos de la cita
     * @returns {Promise<Object>} Cita creada
     */
    async createAppointment(appointmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(appointmentData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error al crear cita:', error);
            throw error;
        }
    }

    /**
     * Eliminar una cita
     * @param {number} appointmentId - ID de la cita a eliminar
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteAppointment(appointmentId) {
        try {
            const url = `${API_BASE_URL}/appointments/${appointmentId}`;
            console.log(`[AppointmentService] Eliminando cita ${appointmentId} en:`, url);
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            console.log(`[AppointmentService] Response status: ${response.status}`);

            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Error ${response.status}`;
                }
                console.error('[AppointmentService] Error response:', errorText);
                
                // Intentar parsear como JSON si es posible
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText };
                }
                
                throw new Error(errorData.message || errorData.error || `Error: ${response.status}`);
            }

            // El backend devuelve 204 (No Content) cuando elimina exitosamente
            // No intentar parsear JSON si no hay contenido
            if (response.status === 204) {
                console.log(`[AppointmentService] Cita ${appointmentId} eliminada exitosamente (204 No Content)`);
                return { success: true, message: 'Cita eliminada exitosamente' };
            }

            // Si hay contenido, intentar parsearlo
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`[AppointmentService] Cita eliminada exitosamente:`, data);
                return data;
            }

            return { success: true, message: 'Cita eliminada exitosamente' };
        } catch (error) {
            console.error('Error al eliminar cita:', error);
            throw error;
        }
    }
}

const appointmentService = new AppointmentService();
export default appointmentService;

