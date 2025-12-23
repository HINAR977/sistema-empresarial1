const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbMySQL'); // conexión MySQL

// Definición del modelo
const UserMySQL = sequelize.define('UserMySQL', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users', // nombre de la tabla en la base de datos
  timestamps: true
});

module.exports = { UserMySQL };
