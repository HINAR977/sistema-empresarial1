// checkConnections.js

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const http = require('http');

// MySQL
const MYSQL_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'SISTEMA_EMPRESARIAL'
};

// MongoDB
const MONGO_URI = "mongodb://localhost:27017";

// API
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_PATH = '/';

// Función principal
(async () => {

    // ===== MySQL =====
    try {
        const connection = await mysql.createConnection(MYSQL_CONFIG);
        console.log('✅ MySQL conectado correctamente');
        await connection.end();
    } catch (err) {
        console.error('❌ Error al conectar a MySQL:', err.message);
    }

    // ===== MongoDB =====
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ MongoDB conectado correctamente');
        await client.close();
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err.message);
    }

    // ===== API =====
    const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: API_PATH,
        method: 'GET'
    };

    const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            console.log(`✅ API respondió correctamente: ${res.statusCode} -> ${data}`);
        });
    });

    req.on('error', err => {
        console.error('❌ Error al conectar con la API:', err.message);
    });

    req.end();

})();
