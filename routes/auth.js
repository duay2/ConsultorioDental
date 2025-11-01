const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Ruta de autenticación
 * POST /api/auth/login
 * No requiere autenticación previa
 */
router.post(
    '/login',
    authController.validateLogin,
    authController.login
);

module.exports = router;

