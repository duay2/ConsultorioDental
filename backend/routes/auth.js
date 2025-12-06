const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Rutas de autenticación
 * No requieren autenticación previa
 */

// POST /api/auth/register - Registrar nuevo usuario
router.post(
    '/register',
    authController.validateRegister,
    authController.register
);

// POST /api/auth/login - Iniciar sesión
router.post(
    '/login',
    authController.validateLogin,
    authController.login
);

module.exports = router;

