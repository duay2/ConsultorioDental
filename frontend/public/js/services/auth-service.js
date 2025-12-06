/**
 * Servicio de autenticación
 * Maneja login, logout y almacenamiento de datos del usuario
 */

const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
    constructor() {
        this.tokenKey = 'dentalflow_token';
        this.userKey = 'dentalflow_user';
    }

    /**
     * Realiza login del usuario
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Datos del usuario y token
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Error al iniciar sesión';
                throw new Error(errorMessage);
            }

            // Guardar token y datos del usuario
            localStorage.setItem(this.tokenKey, data.token);
            localStorage.setItem(this.userKey, JSON.stringify(data.user));

            return data;
        } catch (error) {
            // Si es un error de red, dar un mensaje más claro
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
            }
            throw error;
        }
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Obtiene el token almacenado
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Obtiene los datos del usuario almacenados
     * @returns {Object|null}
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Obtiene el header de autorización para peticiones API
     * @returns {Object}
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// Exportar instancia singleton
export default new AuthService();
