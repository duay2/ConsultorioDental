const User = require('../models/User');
const databaseConnection = require('../config/database');

/**
 * Obtener todos los usuarios con paginación
 * GET /api/users?page=1&limit=10
 */
const getAllUsers = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const userModel = new User();
        const result = await userModel.findAll(page, limit);

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            data: result.users,
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
 * Obtener un usuario por ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Usuario obtenido exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Crear un nuevo usuario
 * POST /api/users
 */
const createUser = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userModel = new User();
        const user = await userModel.create(req.body);

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        // Si el error es por duplicado, devolver un error más específico
        if (error.message.includes('ya existe')) {
            return res.status(409).json({
                error: 'Usuario duplicado',
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * Actualizar un usuario
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();

        // Verificar que el usuario existe
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Actualizar el usuario
        const result = await userModel.update(userId, req.body);

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo actualizar el usuario',
                message: 'El usuario no fue modificado'
            });
        }

        // Obtener el usuario actualizado
        const updatedUser = await userModel.findById(userId);

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un usuario
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const userId = parseInt(req.params.id);
        const userModel = new User();

        // Verificar que el usuario existe
        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con ID ${userId}`
            });
        }

        // Eliminar el usuario
        const result = await userModel.delete(userId);

        if (result.deletedCount === 0) {
            return res.status(400).json({
                error: 'No se pudo eliminar el usuario',
                message: 'El usuario no fue eliminado'
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener usuario por email
 * GET /api/users/email?email=xxx@xxx.com
 */
const getUserByEmail = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const email = req.query.email;
        const userModel = new User();
        const user = await userModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: `No se encontró un usuario con email ${email}`
            });
        }

        // Excluir la contraseña de la respuesta
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            message: 'Usuario obtenido exitosamente',
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener usuarios por rol
 * GET /api/users/role?role=doctor
 */
const getUsersByRole = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const role = req.query.role;
        const userModel = new User();
        const users = await userModel.findByRole(role);

        // Excluir contraseñas de todos los usuarios
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            role: role,
            count: usersWithoutPasswords.length,
            data: usersWithoutPasswords
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Buscar usuarios por nombre
 * GET /api/users/search?name=Juan
 */
const searchUsersByName = async (req, res, next) => {
    try {
        // Asegurar conexión a la base de datos
        if (!databaseConnection.isConnectionActive()) {
            await databaseConnection.connect();
        }

        const searchTerm = req.query.name;
        const userModel = new User();
        const users = await userModel.searchByName(searchTerm);

        // Excluir contraseñas de todos los usuarios
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            searchTerm: searchTerm,
            count: usersWithoutPasswords.length,
            data: usersWithoutPasswords
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserByEmail,
    getUsersByRole,
    searchUsersByName
};

