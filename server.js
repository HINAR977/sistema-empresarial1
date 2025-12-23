require('dotenv').config();
const express = require('express');

// Conexión a bases de datos
const connectMongoDB = require('./backend/config/dbMongo');       // MongoDB
const { connectMySQL } = require('./backend/config/dbMySQL');      // MySQL (opcional)

// Rutas
const mongoUserRoutes = require('./backend/routes/mongoUserRoutes');
const mysqlUserRoutes = require('./backend/routes/mysqlUserRoutes');

const app = express();
app.use(express.json());

// Conectar a MongoDB y MySQL
connectMongoDB();
connectMySQL();

// Registrar rutas
app.use('/api/mongo-users', mongoUserRoutes);
app.use('/api/mysql-users', mysqlUserRoutes);

// Ruta raíz opcional
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

