const errorHandler = (error, _req, res, _next) => {
    // Errores de validación de Sequelize
    if(error.name === 'SequelizeValidationError') {
        const errObj = {};
        error.errors.map(er => {
            errObj[er.path] = er.message;
        })
        return res.status(400).json(errObj);
    }

    // Violación de clave única (ej: email ya usado)
    if(error.name === 'SequelizeUniqueConstraintError'){
        return res.status(400).json({
            message: 'Valor único duplicado',
            errors: error.errors?.map(e => ({ path: e.path, value: e.value }))
        });
    }

    // Errores de llave foránea
    if(error.name === 'SequelizeForeignKeyConstraintError'){
        return res.status(400).json({ 
            message: error.message,
            error: error.parent?.detail
        });
    }

    // Errores de base de datos
    if(error.name === 'SequelizeDatabaseError'){
        return res.status(400).json({ 
            message: error.message
        });
    }

    // Error de parseo JSON del body-parser
    if(error instanceof SyntaxError && error.status === 400 && 'body' in error){
        return res.status(400).json({ message: 'JSON inválido en el cuerpo de la petición' });
    }

    // Fallback genérico
    return res.status(500).json({
        message: error.message,
        error: error
    });
}

module.exports = errorHandler;