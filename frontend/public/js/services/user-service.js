/**
 * Servicio para manejar las operaciones de usuarios/doctores con la API
 */
const API_BASE_URL = 'http://localhost:3000/api';

class UserService {
    constructor() {
    }

    async getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Usar auth-service para obtener el token
        const authService = await import('./auth-service.js');
        const token = authService.default.getToken();
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Obtener todos los usuarios con paginación
     * @param {number} page - Número de página
     * @param {number} limit - Límite de resultados por página
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getAllUsers(page = 1, limit = 10) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async getUserById(id) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Crear un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Usuario creado
     */
    async createUser(userData) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers,
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualizar un usuario
     * @param {number} id - ID del usuario
     * @param {Object} userData - Datos actualizados del usuario
     * @returns {Promise<Object>} Usuario actualizado
     */
    async updateUser(id, userData) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Eliminar un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener usuarios por rol (doctores)
     * @param {string} role - Rol del usuario (doctor, admin, etc.)
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getUsersByRole(role = 'doctor') {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${API_BASE_URL}/users/role?role=${role}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener doctores y dentistas (combina ambos roles)
     * @returns {Promise<Array>} Lista de doctores y dentistas
     */
    async getDoctorsAndDentists() {
        try {
            // Obtener usuarios con rol 'doctor' y 'dentista' (solo roles válidos en minúsculas)
            const [doctors, dentists] = await Promise.all([
                this.getUsersByRole('doctor').catch(err => {
                    console.warn('Error al obtener doctores:', err);
                    return [];
                }),
                this.getUsersByRole('dentista').catch(err => {
                    console.warn('Error al obtener dentistas:', err);
                    return [];
                })
            ]);

            // Combinar todos los resultados
            const allDoctors = [...doctors, ...dentists];
            
            // Eliminar duplicados por ID
            const uniqueDoctors = allDoctors.filter((doctor, index, self) => 
                index === self.findIndex(d => d.id === doctor.id)
            );

            return uniqueDoctors;
        } catch (error) {
            throw error;
        }
    }
}

const userService = new UserService();
export default userService;
