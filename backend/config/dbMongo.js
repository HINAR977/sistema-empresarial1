// backend/config/dbMongo.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const connectMongoDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI no definido');
    return { success: false, error: 'MONGO_URI no definido' };
  }

  try {
    await mongoose.connect(uri); // <- Sin opciones obsoletas
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = connectMongoDB;