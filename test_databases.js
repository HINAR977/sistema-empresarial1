// ============================
// 1️⃣ Dependencias
// ============================
const mysql = require('mysql2');
const mongoose = require('mongoose');

// ============================
// 2️⃣ Configuración MySQL
// ============================
const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: 'tu_contraseña', // reemplaza con tu password
  database: 'sistema_empresarial'
};

const mysqlConnection = mysql.createConnection(mysqlConfig);

// ============================
// 3️⃣ Configuración MongoDB
// ============================
const mongoUri = 'mongodb://localhost:27017/sistema_empresarial';

// ============================
// 4️⃣ Función para probar MySQL
// ============================
function testMySQL() {
  return new Promise((resolve) => {
    mysqlConnection.connect(err => {
      if (err) {
        console.error('❌ Error de conexión MySQL:', err.message);
        resolve(false);
      } else {
        console.log('✅ Conexión a MySQL exitosa');
        mysqlConnection.end();
        resolve(true);
      }
    });
  });
}

// ============================
// 5️⃣ Función para probar MongoDB
// ============================
function testMongoDB() {
  return mongoose.connect(mongoUri)
    .then(() => {
      console.log('✅ Conexión a MongoDB exitosa');
      return mongoose.connection.close().then(() => true);
    })
    .catch(err => {
      console.error('❌ Error de conexión MongoDB:', err.message);
      return false;
    });
}

// ============================
// 6️⃣ Ejecutar ambas pruebas
// ============================
async function testDatabases() {
  console.log('🔹 Probando conexiones a las bases de datos...');
  
  const [mysqlResult, mongoResult] = await Promise.all([
    testMySQL(),
    testMongoDB()
  ]);

  console.log('==============================');
  console.log('Resumen de conexiones:');
  console.log(`MySQL: ${mysqlResult ? '✅ Conectado' : '❌ Falló'}`);
  console.log(`MongoDB: ${mongoResult ? '✅ Conectado' : '❌ Falló'}`);
  console.log('==============================');
}

testDatabases();