const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Not required for OAuth
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 