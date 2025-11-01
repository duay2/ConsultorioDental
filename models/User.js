const { ObjectId } = require('mongodb');
const databaseConnection = require('../config/database');

/**
 * Clase User - Operaciones básicas de usuarios
 */
class User {
    constructor() {
        this.collection = null;
    }

    async init() {
        this.collection = databaseConnection.getCollection('users');
    }

    // Obtener el siguiente ID numérico
    async getNextId() {
        // Buscar el último usuario con ID numérico
        const lastUser = await this.collection.findOne({ id: { $exists: true, $type: "number" } }, { sort: { id: -1 } });
        
        if (lastUser) {
            return lastUser.id + 1;
        }
        
        // Si no hay usuarios con ID numérico, contar los existentes y empezar desde ahí
        const totalUsers = await this.collection.countDocuments({});
        return totalUsers + 1;
    }

    // Crear un nuevo usuario (evita duplicados)
    async create(userData) {
        await this.init();
        
        // Verificar si el usuario ya existe
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error(`Usuario con email ${userData.email} ya existe`);
        }
        
        // Obtener el siguiente ID numérico
        const nextId = await this.getNextId();
        
        const user = {
            id: nextId,
            email: userData.email,
            password: userData.password,
            name: userData.name,
            last_name: userData.last_name || '',
            role: userData.role,
            specialty: userData.specialty || '',
            phone: userData.phone || '',
            is_active: true,
            created_at: new Date()
        };
        const result = await this.collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    // Buscar usuario por ID
    async findById(userId) {
        await this.init();
        return await this.collection.findOne({ id: parseInt(userId) });
    }

    // Buscar usuario por email
    async findByEmail(email) {
        await this.init();
        return await this.collection.findOne({ email: email });
    }

    // Buscar usuarios por rol
    async findByRole(role) {
        await this.init();
        return await this.collection.find({ role: role, is_active: true }).toArray();
    }

    // Buscar usuarios por nombre
    async searchByName(searchTerm) {
        await this.init();
        const regex = new RegExp(searchTerm, 'i');
        return await this.collection.find({
            $or: [
                { name: regex },
                { last_name: regex }
            ],
            is_active: true
        }).toArray();
    }

    // Eliminar usuario permanentemente (método alternativo)
    async permanentDelete(userId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(userId) });
    }

    // Verificar si usuario tiene permiso
    async hasPermission(userId, resource, action) {
        await this.init();
        const user = await this.findById(userId);
        if (!user || !user.is_active) {
            return false;
        }
        return user.permissions && user.permissions[resource] && user.permissions[resource][action] === true;
    }

    // Obtener todos los usuarios con paginación
    async findAll(page = 1, limit = 10) {
        await this.init();
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.collection.find({ is_active: true }).skip(skip).limit(limit).toArray(),
            this.collection.countDocuments({ is_active: true })
        ]);
        return { users, total, page, limit };
    }

    // Actualizar datos del usuario
    async update(userId, updateData) {
        await this.init();
        return await this.collection.updateOne(
            { id: parseInt(userId) },
            { $set: { ...updateData, updated_at: new Date() } }
        );
    }

    // Verificar credenciales de login
    async verifyCredentials(email, password) {
        await this.init();
        const user = await this.collection.findOne({
            email: email,
            password: password,
            is_active: true
        });
        return user ? { ...user, password: undefined } : null;
    }

    // Eliminar usuario permanentemente
    async delete(userId) {
        await this.init();
        return await this.collection.deleteOne({ id: parseInt(userId) });
    }
}

module.exports = User;