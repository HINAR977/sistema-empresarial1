// 1️⃣ Cargar dependencias
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectMongoDB = require('./config/dbMongo'); // Ajusta la ruta según tu proyecto
const { connectMySQL } = require('./config/dbMySQL'); // Ajusta la ruta según tu proyecto

// 2️⃣ Conectar bases de datos
connectMongoDB();
connectMySQL();

// 3️⃣ Crear app Express
const app = express();
app.use(express.json());

// 4️⃣ Importar rutas
const mongoUserRoutes = require('./routes/mongoUserRoutes');
const mysqlUserRoutes = require('./routes/mysqlUserRoutes');

// 5️⃣ Registrar rutas
app.use('/api/mongo-users', mongoUserRoutes);
app.use('/api/mysql-users', mysqlUserRoutes);

// 6️⃣ Ruta raíz
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// 7️⃣ Puerto del servidor
const PORT = process.env.PORT || 3000;

// 🔹 Escuchar en todas las interfaces (0.0.0.0) para evitar problemas de localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
