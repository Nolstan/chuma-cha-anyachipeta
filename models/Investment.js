const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Investment', InvestmentSchema);
