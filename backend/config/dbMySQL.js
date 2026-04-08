// backend/config/dbMySQL.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false // opcional para no mostrar queries
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { sequelize, testConnection };