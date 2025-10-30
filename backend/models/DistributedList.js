const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  firstName: String,
  phone: String,
  notes: String
});
const DistributedSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  items: [ItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('DistributedList', DistributedSchema);
