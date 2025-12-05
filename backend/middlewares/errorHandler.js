/**
 * Middleware centralizado de manejo de errores
 * Captura todos los errores y responde con códigos HTTP apropiados
 */
const errorHandler = (err, req, res, next) => {
    // Log del error para debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            message: err.message
        });
    }

    // Errores de MongoDB
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) {
            return res.status(409).json({
                error: 'Conflicto',
                message: 'Ya existe un registro con estos datos'
            });
        }
        return res.status(500).json({
            error: 'Error de base de datos',
            message: 'Ocurrió un error al interactuar con la base de datos'
        });
    }

    // Errores de Cast (ID inválido en MongoDB)
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'ID inválido',
            message: 'El ID proporcionado no es válido'
        });
    }

    // Errores de autenticación
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Error de autenticación',
            message: err.message || 'Token inválido o expirado'
        });
    }

    // Errores personalizados con código de estado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.name || 'Error',
            message: err.message
        });
    }

    // Error por defecto (500)
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error interno en el servidor'
    });
};

module.exports = errorHandler;

