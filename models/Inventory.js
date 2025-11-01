const { ObjectId } = require('mongodb');
const databaseConnection = require('../config/database');

/**
 * Clase Inventory - Operaciones básicas de inventario
 */
class Inventory {
    constructor() {
        this.collection = null;
    }

    async init() {
        this.collection = databaseConnection.getCollection('inventory');
    }

    // Obtener el siguiente ID numérico
    async getNextId() {
        // Buscar el último item con ID numérico
        const lastItem = await this.collection.findOne({ id: { $exists: true, $type: "number" } }, { sort: { id: -1 } });
        
        if (lastItem) {
            return lastItem.id + 1;
        }
        
        // Si no hay items con ID numérico, contar los existentes y empezar desde ahí
        const totalItems = await this.collection.countDocuments({});
        return totalItems + 1;
    }

    // Crear un nuevo item de inventario
    async create(itemData) {
        await this.init();
        const nextId = await this.getNextId();
        const item = {
            id: nextId,
            name: itemData.name,
            category: itemData.category,
            description: itemData.description || '',
            current_stock: itemData.current_stock || 0,
            min_stock: itemData.min_stock || 0,
            cost_per_unit: itemData.cost_per_unit || 0,
            supplier: itemData.supplier || '',
            created_at: new Date(),
            stock_adjustments: []
        };
        const result = await this.collection.insertOne(item);
        return { ...item, _id: result.insertedId };
    }

    // Buscar item por ID
    async findById(itemId) {
        await this.init();
        return await this.collection.findOne({ id: parseInt(itemId) });
    }

    // Buscar items por categoría
    async findByCategory(category) {
        await this.init();
        return await this.collection.find({ category: category }).toArray();
    }

    // Buscar items por nombre
    async searchByName(searchTerm) {
        await this.init();
        const regex = new RegExp(searchTerm, 'i');
        return await this.collection.find({
            name: regex
        }).toArray();
    }

    // Obtener todos los items con paginación
    async findAll(page = 1, limit = 10) {
        await this.init();
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.collection.find({}).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments({})
        ]);
        return { items, total, page, limit };
    }

    // Actualizar datos del item
    async update(itemId, updateData) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(itemId) },
            { $set: { ...updateData, updated_at: new Date() } }
        );
    }

    // Ajustar stock del item
    async adjustStock(itemId, quantity, reason) {
        await this.init();
        const item = await this.findById(itemId);
        if (!item) {
            throw new Error('Item no encontrado');
        }
        
        const newStock = item.current_stock + quantity;
        
        const adjustment = {
            quantity: quantity,
            reason: reason,
            previous_stock: item.current_stock,
            new_stock: newStock,
            created_at: new Date()
        };

        return await this.collection.updateOne(
            { id: parseInt(itemId) },
            { 
                $set: { current_stock: newStock, updated_at: new Date() },
                $push: { stock_adjustments: adjustment }
            }
        );
    }

    // Eliminar item permanentemente
    async delete(itemId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(itemId) });
    }
}

module.exports = Inventory;