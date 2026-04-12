const mongoose = require('mongoose');

const tenantAdvanceSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    label: { type: String, required: true },
    tenantName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    color: { type: String, default: 'expense' },
    archived: { type: Boolean, default: false }
});

module.exports = mongoose.model('TenantAdvance', tenantAdvanceSchema);
