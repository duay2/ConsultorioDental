const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticateToken = require('../middlewares/auth');
const {
    validateCreateInventory,
    validateUpdateInventory,
    validateInventoryId,
    validateAdjustStock,
    validateCategoryQuery,
    validateInventorySearchQuery
} = require('../middlewares/validation');

/**
 * Rutas para gestión de inventario (Inventory)
 * Todas las rutas requieren autenticación JWT
 */

// Ruta para obtener todos los items con paginación
// GET /api/inventory?page=1&limit=10
router.get(
    '/',
    authenticateToken,
    inventoryController.getAllInventory
);

// Ruta para buscar items por categoría
// GET /api/inventory/category?category=materiales
router.get(
    '/category',
    authenticateToken,
    validateCategoryQuery,
    inventoryController.getInventoryByCategory
);

// Ruta para buscar items por nombre
// GET /api/inventory/search?name=anestesia
router.get(
    '/search',
    authenticateToken,
    validateInventorySearchQuery,
    inventoryController.searchInventoryByName
);

// Ruta para obtener un item por ID
// GET /api/inventory/:id
router.get(
    '/:id',
    authenticateToken,
    validateInventoryId,
    inventoryController.getInventoryById
);

// Ruta para crear un nuevo item
// POST /api/inventory
router.post(
    '/',
    authenticateToken,
    validateCreateInventory,
    inventoryController.createInventoryItem
);

// Ruta para actualizar un item completo
// PUT /api/inventory/:id
router.put(
    '/:id',
    authenticateToken,
    validateInventoryId,
    validateUpdateInventory,
    inventoryController.updateInventoryItem
);

// Ruta para ajustar stock de un item
// PATCH /api/inventory/:id/stock
router.patch(
    '/:id/stock',
    authenticateToken,
    validateInventoryId,
    validateAdjustStock,
    inventoryController.adjustStock
);

// Ruta para eliminar un item
// DELETE /api/inventory/:id
router.delete(
    '/:id',
    authenticateToken,
    validateInventoryId,
    inventoryController.deleteInventoryItem
);

module.exports = router;

