const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado correctamente');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
