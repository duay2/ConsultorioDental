const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');
const {
    validateCreateUser,
    validateUpdateUser,
    validateUserId,
    validateEmail,
    validateRole,
    validateNameSearch,
    validatePagination
} = require('../middlewares/validation');

/**
 * Rutas para gestión de usuarios (Users)
 * Todas las rutas requieren autenticación JWT
 */

// Ruta para obtener todos los usuarios con paginación
// GET /api/users?page=1&limit=10
router.get(
    '/',
    authenticateToken,
    validatePagination,
    userController.getAllUsers
);

// Ruta para buscar usuario por email
// GET /api/users/email?email=xxx@xxx.com
router.get(
    '/email',
    authenticateToken,
    validateEmail,
    userController.getUserByEmail
);

// Ruta para obtener usuarios por rol
// GET /api/users/role?role=doctor
router.get(
    '/role',
    authenticateToken,
    validateRole,
    userController.getUsersByRole
);

// Ruta para buscar usuarios por nombre
// GET /api/users/search?name=Juan
router.get(
    '/search',
    authenticateToken,
    validateNameSearch,
    userController.searchUsersByName
);

// Ruta para obtener un usuario por ID
// GET /api/users/:id
router.get(
    '/:id',
    authenticateToken,
    validateUserId,
    userController.getUserById
);

// Ruta para crear un nuevo usuario
// POST /api/users
router.post(
    '/',
    authenticateToken,
    validateCreateUser,
    userController.createUser
);

// Ruta para actualizar un usuario completo
// PUT /api/users/:id
router.put(
    '/:id',
    authenticateToken,
    validateUpdateUser,
    userController.updateUser
);

// Ruta para eliminar un usuario
// DELETE /api/users/:id
router.delete(
    '/:id',
    authenticateToken,
    validateUserId,
    userController.deleteUser
);

module.exports = router;

