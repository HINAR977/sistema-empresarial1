// backend/models/UserMySQL.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbMySQL');

const UserMySQL = sequelize.define('UserMySQL', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users_mysql',
  timestamps: true
});

module.exports = UserMySQL;