const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y que el usuario exista
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Obtener el token del header Authorization (siguiendo el patrón del ejemplo)
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ 
                error: 'Token no fue proporcionado',
                message: 'Se requiere un token JWT válido en el header Authorization'
            });
        }

        // Extraer el token sin "Bearer "
        const tokenWithoutBearer = token.split(' ')[1];
        
        if (!tokenWithoutBearer) {
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'El formato del token no es válido. Use: Bearer <token>'
            });
        }

        // Verificar y decodificar el token
        const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(tokenWithoutBearer, secretKey);

        // Verificar que el usuario exista y esté activo
        const userModel = new User();
        const user = await userModel.findById(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({ 
                error: 'Token inválido',
                message: 'El usuario asociado al token no existe o está inactivo'
            });
        }

        // Agregar información del usuario al request (siguiendo patrón del ejemplo)
        req.userId = decoded.userId;
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        next();
    } catch (err) {
        return res.status(401).json({ 
            error: 'Token inválido',
            message: err.message || 'El token proporcionado no es válido'
        });
    }
};

module.exports = authenticateToken;

