const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth');
const { restrictSecretary } = require('../middlewares/authorization');
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
// Restringida para secretaria
router.get(
    '/',
    authenticateToken,
    restrictSecretary,
    validatePagination,
    userController.getAllUsers
);

// Ruta para buscar usuario por email
// GET /api/users/email?email=xxx@xxx.com
// Restringida para secretaria
router.get(
    '/email',
    authenticateToken,
    restrictSecretary,
    validateEmail,
    userController.getUserByEmail
);

// Ruta para obtener usuarios por rol
// GET /api/users/role?role=doctor
// Restringida para secretaria
router.get(
    '/role',
    authenticateToken,
    restrictSecretary,
    validateRole,
    userController.getUsersByRole
);

// Ruta para buscar usuarios por nombre
// GET /api/users/search?name=Juan
// Restringida para secretaria
router.get(
    '/search',
    authenticateToken,
    restrictSecretary,
    validateNameSearch,
    userController.searchUsersByName
);

// Ruta para obtener un usuario por ID
// GET /api/users/:id
// Restringida para secretaria
router.get(
    '/:id',
    authenticateToken,
    restrictSecretary,
    validateUserId,
    userController.getUserById
);

// Ruta para crear un nuevo usuario
// POST /api/users
// Restringida para secretaria
router.post(
    '/',
    authenticateToken,
    restrictSecretary,
    validateCreateUser,
    userController.createUser
);

// Ruta para actualizar un usuario completo
// PUT /api/users/:id
// Restringida para secretaria
router.put(
    '/:id',
    authenticateToken,
    restrictSecretary,
    validateUpdateUser,
    userController.updateUser
);

// Ruta para eliminar un usuario
// DELETE /api/users/:id
// Restringida para secretaria
router.delete(
    '/:id',
    authenticateToken,
    restrictSecretary,
    validateUserId,
    userController.deleteUser
);

module.exports = router;

