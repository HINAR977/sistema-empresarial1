const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { validateCreateUser, validateUpdateUser, validatePagination } = require('../middlewares/validationMiddleware');

// Obtener todos los usuarios (solo admin o supervisor)
router.get('/', verifyToken, requireRole('admin', 'supervisor'), validatePagination, UserController.getAllUsers);

// Obtener usuario por ID (solo admin o supervisor)
router.get('/:id', verifyToken, requireRole('admin', 'supervisor'), UserController.getUserById);

// Crear usuario (solo admin)
router.post('/', verifyToken, requireRole('admin'), validateCreateUser, UserController.createUser);

// Actualizar usuario (solo admin)
router.put('/:id', verifyToken, requireRole('admin'), validateUpdateUser, UserController.updateUser);

// Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, requireRole('admin'), UserController.deleteUser);

module.exports = router;