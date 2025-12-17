const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'usuario' },
  activo: { type: Boolean, default: true },
  ultimo_login: { type: Date },
  intentos_fallidos: { type: Number, default: 0 },
  bloqueado_hasta: { type: Date },
  refreshTokens: [{
    token: String,
    userAgent: String,
    ipAddress: String,
    expira_en: Date,
    revocado: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// Hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Métodos útiles
userSchema.methods.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.incrementFailedAttempts = async function() {
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockMinutes = parseInt(process.env.LOCK_TIME_MINUTES) || 30;
  this.intentos_fallidos += 1;
  if (this.intentos_fallidos >= maxAttempts) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + lockMinutes);
    this.bloqueado_hasta = lockUntil;
  }
  await this.save();
};

userSchema.methods.isLocked = function() {
  return this.bloqueado_hasta && this.bloqueado_hasta > new Date();
};

userSchema.methods.updateLastLogin = async function() {
  this.ultimo_login = new Date();
  this.intentos_fallidos = 0;
  this.bloqueado_hasta = null;
  await this.save();
};

userSchema.methods.saveRefreshToken = async function(token, userAgent, ipAddress, expiresInDays) {
  const expira_en = new Date();
  expira_en.setDate(expira_en.getDate() + expiresInDays);
  this.refreshTokens.push({ token, userAgent, ipAddress, expira_en });
  await this.save();
};

userSchema.statics.verifyRefreshToken = async function(token) {
  const user = await this.findOne({
    'refreshTokens.token': token,
    'refreshTokens.revocado': false,
    'refreshTokens.expira_en': { $gt: new Date() },
    activo: true
  });
  if (!user) return null;
  const refreshToken = user.refreshTokens.find(rt => rt.token === token);
  return { user, refreshToken };
};

userSchema.methods.revokeRefreshToken = async function(token) {
  const rt = this.refreshTokens.find(rt => rt.token === token);
  if (rt) rt.revocado = true;
  await this.save();
};

userSchema.methods.revokeAllRefreshTokens = async function() {
  this.refreshTokens.forEach(rt => rt.revocado = true);
  await this.save();
};

module.exports = mongoose.model('UserMongo', userSchema);
