/**
 * Servidor principal Express
 */
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ==================== MIDDLEWARES DE SEGURIDAD ====================

// Helmet - Headers de seguridad
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes, intenta más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Rate limiting estricto para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // máximo 5 intentos de login
    message: {
        success: false,
        message: 'Demasiados intentos de login, intenta en 15 minutos'
    }
});

// ==================== MIDDLEWARES GENERALES ====================

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ==================== RUTAS ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/auth/login', loginLimiter); // Rate limit específico para login

// Rutas de usuarios
app.use('/api/users', userRoutes);

// ==================== MANEJO DE ERRORES ====================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Error de JSON malformado
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'JSON inválido'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : err.message
    });
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   🚀 Servidor iniciado correctamente       ║
    ║   📍 Puerto: ${PORT}                           ║
    ║   🌍 Entorno: ${process.env.NODE_ENV || 'development'}               ║
    ║   📅 ${new Date().toLocaleString()}          ║
    ╚════════════════════════════════════════════╝
    `);
});

module.exports = app;