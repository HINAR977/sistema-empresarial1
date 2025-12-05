/**
 * Rutas de usuarios
 */
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');
const { validateCreateUser, validateUpdateUser, validatePagination } = require('../middlewares/validationMiddleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// CRUD de usuarios
router.get('/', requirePermission('usuarios', 'leer'), validatePagination, UserController.getAll);
router.get('/:id', requirePermission('usuarios', 'leer'), UserController.getById);
router.post('/', requirePermission('usuarios', 'crear'), validateCreateUser, UserController.create);
router.put('/:id', requirePermission('usuarios', 'actualizar'), validateUpdateUser, UserController.update);
router.delete('/:id', requirePermission('usuarios', 'eliminar'), UserController.delete);

module.exports = router;