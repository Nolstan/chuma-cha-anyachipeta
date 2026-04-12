const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false }
});

module.exports = mongoose.model('Tenant', tenantSchema);
