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
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            return data.data || [];
        } catch (error) {
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
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
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
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
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
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updateData)
            });


            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar el estado de una cita (incluyendo si está completada)
     * @param {number} appointmentId - ID de la cita
     * @param {string} status - Nuevo estado de la cita
     * @returns {Promise<Object>} Cita actualizada
     */
    async updateAppointmentStatus(appointmentId, status) {
        try {
            const url = `${API_BASE_URL}/appointments/${appointmentId}/status`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ status: status })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
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
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });


            if (!response.ok) {
                let errorText = '';
                try {
                    errorText = await response.text();
                } catch (e) {
                    errorText = `Error ${response.status}`;
                }
                
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
                return { success: true, message: 'Cita eliminada exitosamente' };
            }

            // Si hay contenido, intentar parsearlo
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            }

            return { success: true, message: 'Cita eliminada exitosamente' };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener citas por ID de paciente
     * @param {number|string} patientId - ID del paciente
     * @returns {Promise<Object>} Objeto con lista de citas
     */
    async getAppointmentsByPatientId(patientId) {
        try {
            // Asegurar que patientId sea un número entero
            const id = parseInt(patientId, 10);
            if (isNaN(id) || id <= 0) {
                throw new Error('ID de paciente inválido');
            }

            const url = `${API_BASE_URL}/appointments/patient/${id}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}

const appointmentService = new AppointmentService();
export default appointmentService;

