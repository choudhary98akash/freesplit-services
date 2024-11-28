const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  addedBy: { type: String, required: true }, // Reference to the sender
});

module.exports = mongoose.model('Person', PersonSchema);
