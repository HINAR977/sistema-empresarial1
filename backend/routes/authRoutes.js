const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateLogin } = require('../middlewares/validators'); // Ajusta según tu middleware

// Rutas de autenticación
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);
router.get('/profile', AuthController.getProfile);

module.exports = router;
