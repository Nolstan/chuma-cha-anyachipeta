const mongoose = require('mongoose');

const RepaymentSchema = new mongoose.Schema({
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    lender: { type: String, required: true },
});

module.exports = mongoose.model('Repayment', RepaymentSchema);
