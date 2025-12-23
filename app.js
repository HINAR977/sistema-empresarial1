// 1️⃣ Cargar dependencias
const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // carga variables de entorno desde .env

// 2️⃣ Conexión a bases de datos
const connectMongoDB = require('./config/dbMongo'); // ruta correcta desde app.js
const { connectMySQL } = require('./config/dbMySQL'); // si tienes configuración MySQL
connectMongoDB();
connectMySQL();

// 3️⃣ Crear aplicación Express
const app = express();
app.use(express.json()); // middleware para parsear JSON

// 4️⃣ Importar rutas
const mongoUserRoutes = require('./routes/mongoUserRoutes');
const mysqlUserRoutes = require('./routes/mysqlUserRoutes');

// 5️⃣ Registrar rutas en Express
app.use('/api/mongo-users', mongoUserRoutes);
app.use('/api/mysql-users', mysqlUserRoutes);

// 6️⃣ Ruta raíz (opcional)
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// 7️⃣ Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

