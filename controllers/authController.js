const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Objeto usuario
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

/**
 * Controlador de login - Genera JWT
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Error de validación',
                message: 'Los datos proporcionados no son válidos',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Verificar credenciales
        const userModel = new User();
        const user = await userModel.verifyCredentials(email, password);

        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'El email o la contraseña son incorrectos'
            });
        }

        // Generar token JWT
        const token = generateToken(user);

        // Respuesta exitosa
        res.status(200).json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controlador de registro - Crea nuevo usuario
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Error de validación',
                message: 'Los datos proporcionados no son válidos',
                errors: errors.array()
            });
        }

        const { email, password, name, last_name, role, specialty, phone } = req.body;

        // Crear usuario
        const userModel = new User();
        try {
            const newUser = await userModel.create({
                email,
                password,
                name,
                last_name: last_name || '',
                role: role || 'assistant',
                specialty: specialty || '',
                phone: phone || ''
            });

            // Generar token JWT automáticamente después del registro
            const token = generateToken(newUser);

            // Respuesta exitosa
            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                token: token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            });
        } catch (error) {
            if (error.message.includes('ya existe')) {
                return res.status(409).json({
                    error: 'Usuario ya existe',
                    message: error.message
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware de validación para login
 */
const validateLogin = [
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email debe tener un formato válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 1 }).withMessage('La contraseña no puede estar vacía')
];

/**
 * Middleware de validación para registro
 */
const validateRegister = [
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email debe tener un formato válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
    body('name')
        .notEmpty().withMessage('El nombre es requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    body('role')
        .optional()
        .isIn(['admin', 'doctor', 'assistant']).withMessage('El rol debe ser: admin, doctor o assistant'),
    body('last_name')
        .optional()
        .trim(),
    body('specialty')
        .optional()
        .trim(),
    body('phone')
        .optional()
        .trim()
];

module.exports = {
    login,
    register,
    validateLogin,
    validateRegister
};

