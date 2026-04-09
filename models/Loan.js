const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    lender: { type: String, required: true },
    date: { type: Date, default: Date.now },
    due_date: { type: Date },
    balance: { type: Number, required: true },
});

module.exports = mongoose.model('Loan', LoanSchema);
