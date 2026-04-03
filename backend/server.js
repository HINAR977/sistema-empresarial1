require('dotenv').config(); // cargar .env desde la raíz
const express = require('express');

// backend/server.js
const connectMongoDB = require('./config/dbMongo');   // <- quitar "backend"
const { testConnection } = require('./config/dbMySQL');

const mongoUserRoutes = require('./routes/mongoUserRoutes');
const mysqlUserRoutes = require('./routes/mysqlUserRoutes');

const app = express();
app.use(express.json());

const initDatabases = async () => {
  const [mongoResult, mysqlResult] = await Promise.all([
    connectMongoDB(),
    testConnection()
  ]);

  console.log('==============================');
  console.log('🔹 Resumen de conexiones:');
  console.log(`MongoDB: ${mongoResult.success ? '✅ Conectado' : '❌ Falló - ' + mongoResult.error}`);
  console.log(`MySQL: ${mysqlResult.success ? '✅ Conectado' : '❌ Falló - ' + mysqlResult.error}`);
  console.log('==============================');

  if (!mongoResult.success || !mysqlResult.success) {
    console.error('❌ Algunas conexiones fallaron. Revisar errores y reiniciar.');
    // opcional: process.exit(1);
  }
};

// ============================
// Inicializar servidor
// ============================
(async () => {
  await initDatabases();

  // Rutas
  app.use('/api/mongo-users', mongoUserRoutes);
  app.use('/api/mysql-users', mysqlUserRoutes);

  // Ruta raíz
  app.get('/', (req, res) => res.send('API funcionando correctamente'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
})();