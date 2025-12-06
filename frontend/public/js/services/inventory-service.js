/**
 * inventory-service
 * Servicio para manejar operaciones de inventario con la API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class InventoryService {
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

    async getAllInventory(page = 1, limit = 100) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener inventario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en getAllInventory:', error);
            throw error;
        }
    }

    async getInventoryById(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener el producto');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error en getInventoryById:', error);
            throw error;
        }
    }

    async createInventoryItem(itemData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory`, {
                method: 'POST',
                headers,
                body: JSON.stringify(itemData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al crear el producto');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error en createInventoryItem:', error);
            throw error;
        }
    }

    async updateInventoryItem(id, itemData) {
        try {
            const headers = await this.getAuthHeaders();
            // Asegurar que el ID sea un número
            const productId = parseInt(id);
            console.log('updateInventoryItem - ID:', productId, 'URL:', `${API_BASE_URL}/inventory/${productId}`);
            console.log('updateInventoryItem - Datos:', itemData);
            
            const response = await fetch(`${API_BASE_URL}/inventory/${productId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(itemData)
            });

            console.log('updateInventoryItem - Response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('updateInventoryItem - Error response:', error);
                throw new Error(error.message || error.error || 'Error al actualizar el producto');
            }

            const result = await response.json();
            console.log('updateInventoryItem - Success:', result);
            console.log('updateInventoryItem - Updated data:', result.data);
            
            // Verificar que los datos se actualizaron correctamente
            if (result.data) {
                console.log('updateInventoryItem - Stock actualizado:', result.data.current_stock);
            }
            
            return result.data;
        } catch (error) {
            console.error('Error en updateInventoryItem:', error);
            throw error;
        }
    }

    async deleteInventoryItem(id) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar el producto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en deleteInventoryItem:', error);
            throw error;
        }
    }
}

export default new InventoryService();

