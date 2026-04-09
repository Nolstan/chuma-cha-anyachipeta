const mongoose = require('mongoose');

const MoneyReceivedSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MoneyReceived', MoneyReceivedSchema);
