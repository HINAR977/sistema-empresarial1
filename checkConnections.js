// checkConnections.js

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const axios = require('axios');

// 1️⃣ Configuración MySQL
const MYSQL_CONFIG = {
    host: 'localhost',
    user: 'root',             // Cambia por tu usuario MySQL
    password: 'admin', // Cambia por tu contraseña MySQL
    database: 'SISTEMA_EMPRESARIAL' // Cambia por tu base de datos MySQL
};

// 2️⃣ Configuración MongoDB
const MONGO_URI = "mongodb://localhost:27017";

// 3️⃣ Configuración API
const API_URL = 'http://localhost:3000/'; // usar 127.0.0.1 evita problemas de localhost en Windows

// 4️⃣ Función principal autoejecutable (IIFE)
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
    try {
        const response = await axios({
            method: 'get',
            url: API_URL,
            validateStatus: () => true, // evita errores por código HTTP
            responseType: 'text'        // permite texto plano
        });
        console.log(`✅ API respondió correctamente: ${response.status} -> ${response.data}`);
    } catch (err) {
        console.error('❌ Error al conectar con la API:', err.message);
    }

})();
