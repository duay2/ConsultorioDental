/**
 * Servicio para manejar las operaciones de pacientes con la API
 */
const API_BASE_URL = 'http://localhost:3000/api';

class PatientService {
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
     * Obtener todos los pacientes
     * @param {number} page - Número de página
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Object>} Objeto con pacientes y paginación
     */
    async getAllPatients(page = 1, limit = 100) {
        try {
            const response = await fetch(`${API_BASE_URL}/patients?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Pacientes obtenidos:', data);
            return data.data || [];
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            throw error;
        }
    }
}

const patientService = new PatientService();
export default patientService;

