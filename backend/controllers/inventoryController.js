const Inventory = require('../models/Inventory');
const databaseConnection = require('../config/database');

/**
 * Obtener todos los items de inventario con paginación
 * GET /api/inventory?page=1&limit=10
 */
const getAllInventory = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const inventoryModel = new Inventory();
        const result = await inventoryModel.findAll(page, limit);

        res.status(200).json({
            message: 'Items de inventario obtenidos exitosamente',
            data: result.items,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un item de inventario por ID
 * GET /api/inventory/:id
 */
const getInventoryById = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const itemId = parseInt(req.params.id);
        const inventoryModel = new Inventory();
        const item = await inventoryModel.findById(itemId);

        if (!item) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado',
                message: `No se encontró un item con ID ${itemId}`
            });
        }

        res.status(200).json({
            message: 'Item de inventario obtenido exitosamente',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar items de inventario por categoría
 * GET /api/inventory/category?category=materiales
 */
const getInventoryByCategory = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const category = req.query.category;
        const inventoryModel = new Inventory();
        const items = await inventoryModel.findByCategory(category);

        res.status(200).json({
            message: 'Items de inventario obtenidos por categoría',
            data: items,
            total: items.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar items de inventario por nombre
 * GET /api/inventory/search?name=anestesia
 */
const searchInventoryByName = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const searchTerm = req.query.name;
        const inventoryModel = new Inventory();
        const items = await inventoryModel.searchByName(searchTerm);

        res.status(200).json({
            message: 'Búsqueda de inventario completada',
            data: items,
            total: items.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear un nuevo item de inventario
 * POST /api/inventory
 */
const createInventoryItem = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const inventoryModel = new Inventory();
        const newItem = await inventoryModel.create(req.body);

        res.status(201).json({
            message: 'Item de inventario creado exitosamente',
            data: newItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualizar un item de inventario
 * PUT /api/inventory/:id
 */
const updateInventoryItem = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const itemId = parseInt(req.params.id);
        const inventoryModel = new Inventory();
        
        // Verificar que el item existe
        const existingItem = await inventoryModel.findById(itemId);
        if (!existingItem) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado',
                message: `No se encontró un item con ID ${itemId}`
            });
        }

        // Actualizar el item (excluir campos que no deben actualizarse directamente)
        // Permitir actualizar current_stock directamente si viene en el body
        const { stock_adjustments, id, created_at, _id, ...updateData } = req.body;
        
        console.log('[updateInventoryItem] ItemId:', itemId);
        console.log('[updateInventoryItem] Request body:', req.body);
        console.log('[updateInventoryItem] UpdateData (after destructuring):', updateData);
        console.log('[updateInventoryItem] current_stock in updateData:', updateData.current_stock);
        
        const result = await inventoryModel.update(itemId, updateData);
        
        console.log('[updateInventoryItem] Update result:', {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado'
            });
        }

        // Esperar un momento para asegurar que MongoDB haya procesado la actualización
        await new Promise(resolve => setTimeout(resolve, 200));

        // Obtener el item actualizado
        const updatedItem = await inventoryModel.findById(itemId);
        console.log('[updateInventoryItem] Updated item from DB:', updatedItem);
        console.log('[updateInventoryItem] Updated item current_stock:', updatedItem?.current_stock);

        // Asegurar que current_stock sea un número
        if (updatedItem && typeof updatedItem.current_stock !== 'number') {
            updatedItem.current_stock = parseInt(updatedItem.current_stock) || 0;
        }

        res.status(200).json({
            message: 'Item de inventario actualizado exitosamente',
            data: updatedItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Ajustar stock de un item de inventario
 * PATCH /api/inventory/:id/stock
 */
const adjustStock = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const itemId = parseInt(req.params.id);
        const { quantity, reason } = req.body;

        const inventoryModel = new Inventory();
        
        // Verificar que el item existe
        const existingItem = await inventoryModel.findById(itemId);
        if (!existingItem) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado',
                message: `No se encontró un item con ID ${itemId}`
            });
        }

        // Ajustar el stock
        const result = await inventoryModel.adjustStock(itemId, quantity, reason);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado'
            });
        }

        // Obtener el item actualizado
        const updatedItem = await inventoryModel.findById(itemId);

        res.status(200).json({
            message: 'Stock ajustado exitosamente',
            data: updatedItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un item de inventario
 * DELETE /api/inventory/:id
 */
const deleteInventoryItem = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const itemId = parseInt(req.params.id);
        const inventoryModel = new Inventory();
        
        // Verificar que el item existe
        const existingItem = await inventoryModel.findById(itemId);
        if (!existingItem) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado',
                message: `No se encontró un item con ID ${itemId}`
            });
        }

        const result = await inventoryModel.delete(itemId);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado'
            });
        }

        res.status(200).json({
            message: 'Item de inventario eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllInventory,
    getInventoryById,
    getInventoryByCategory,
    searchInventoryByName,
    createInventoryItem,
    updateInventoryItem,
    adjustStock,
    deleteInventoryItem
};

