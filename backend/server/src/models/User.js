const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String }, // hashed
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }]
});

module.exports = mongoose.model('User', UserSchema); 