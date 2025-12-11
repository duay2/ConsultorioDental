/**
 * Middleware de autorización basado en roles
 * Verifica que el usuario tenga los permisos necesarios para acceder a una ruta
 */

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado (debe venir del middleware authenticateToken)
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                error: 'No autorizado',
                message: 'Usuario no autenticado o sin rol asignado'
            });
        }

        const userRole = req.user.role.toLowerCase();

        // Verificar si el rol del usuario está en los roles permitidos
        const isAllowed = allowedRoles.some(role => 
            role.toLowerCase() === userRole
        );

        if (!isAllowed) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: `No tienes permisos para realizar esta acción. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware específico para verificar que el usuario NO sea secretaria
 * Útil para restringir acceso a funcionalidades que la secretaria no puede usar
 */
const restrictSecretary = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({
            error: 'No autorizado',
            message: 'Usuario no autenticado o sin rol asignado'
        });
    }

    const userRole = req.user.role.toLowerCase();

    // Si es secretaria (receptionist), denegar acceso
    if (userRole === 'receptionist' || userRole === 'secretaria') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'La secretaria no tiene permisos para realizar esta acción'
        });
    }

    next();
};

module.exports = {
    authorize,
    restrictSecretary
};

