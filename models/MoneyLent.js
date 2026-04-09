const mongoose = require('mongoose');

const MoneyLentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    person: { type: String, required: true },
    date: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date },
});

module.exports = mongoose.model('MoneyLent', MoneyLentSchema);
