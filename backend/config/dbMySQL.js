const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL conectado correctamente');
  } catch (err) {
    console.error('❌ Error al conectar MySQL:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };
