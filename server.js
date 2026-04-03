require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2');

// Rutas
const mongoUserRoutes = require('./backend/routes/mongoUserRoutes');
const mysqlUserRoutes = require('./backend/routes/mysqlUserRoutes');

const app = express();
app.use(express.json());

// ============================
// 1️⃣ Función para conectar MongoDB
// ============================
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) return { success: false, error: 'MONGO_URI no definido' };

  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ============================
// 2️⃣ Función para conectar MySQL
// ============================
const connectMySQL = () => {
  const { MYSQL_HOST, MYSQL_DB, MYSQL_USER, MYSQL_PASS } = process.env;
  if (!MYSQL_HOST || !MYSQL_DB || !MYSQL_USER || !MYSQL_PASS) {
    return { success: false, error: 'Variables de MySQL no definidas' };
  }

  const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB
  });

  return new Promise((resolve) => {
    connection.connect(err => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true, connection });
    });
  });
};

// ============================
// 3️⃣ Ejecutar ambas conexiones y mostrar resumen
// ============================
const initDatabases = async () => {
  const [mongoResult, mysqlResult] = await Promise.all([
    connectMongoDB(),
    connectMySQL()
  ]);

  console.log('==============================');
  console.log('🔹 Resumen de conexiones:');
  console.log(`MongoDB: ${mongoResult.success ? '✅ Conectado' : '❌ Falló - ' + mongoResult.error}`);
  console.log(`MySQL: ${mysqlResult.success ? '✅ Conectado' : '❌ Falló - ' + mysqlResult.error}`);
  console.log('==============================');

  if (!mongoResult.success || !mysqlResult.success) {
    console.error('❌ Algunas conexiones fallaron. Revisar errores y reiniciar.');
    // Opcional: detener la app si alguna conexión falla
    // process.exit(1);
  }

  return mysqlResult.success ? mysqlResult.connection : null;
};

// ============================
// 4️⃣ Inicializar
// ============================
(async () => {
  const mysqlConnection = await initDatabases();

  // Rutas
  app.use('/api/mongo-users', mongoUserRoutes);
  app.use('/api/mysql-users', mysqlUserRoutes);

  // Ruta raíz
  app.get('/', (req, res) => res.send('API funcionando correctamente'));

  // Puerto
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
})();