// backend/middlewares/validators.js
const { body, validationResult } = require('express-validator');

const validateLogin = [
    body('username').notEmpty().withMessage('El username es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateLogin };
