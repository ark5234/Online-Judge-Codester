const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true }, // e.g., 'global'
    data: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
