const mongoose = require('mongoose');
const AgentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  mobile: String,
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
