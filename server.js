const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Root route - serve the frontend index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Models
const Investment = require('./models/Investment');
const Loan = require('./models/Loan');
const Repayment = require('./models/Repayment');
const MoneyLent = require('./models/MoneyLent');
const MoneyReceived = require('./models/MoneyReceived');

// Routes
// 1. Add Investment
app.post('/api/investments', async (req, res) => {
    try {
        const { amount, category, date } = req.body;
        const investment = new Investment({ amount, category, date: date || new Date() });
        await investment.save();
        res.status(201).json(investment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. Add Loan
app.post('/api/loans', async (req, res) => {
    try {
        const { amount, lender, date, due_date } = req.body;
        const loan = new Loan({ amount, lender, date: date || new Date(), due_date, balance: amount });
        await loan.save();
        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Repay Loan
app.post('/api/repayments', async (req, res) => {
    try {
        const { loanId, amount, date } = req.body;
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        const repayment = new Repayment({ loanId, amount, date: date || new Date(), lender: loan.lender });
        await repayment.save();

        loan.balance -= amount;
        await loan.save();

        res.status(201).json({ repayment, remainingBalance: loan.balance });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Add Money Lent
app.post('/api/money-lent', async (req, res) => {
    try {
        const { amount, person, date, expectedReturnDate } = req.body;
        const moneyLent = new MoneyLent({ amount, person, date: date || new Date(), expectedReturnDate });
        await moneyLent.save();
        res.status(201).json(moneyLent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. Add Money Received
app.post('/api/money-received', async (req, res) => {
    try {
        const { amount, source, date } = req.body;
        const moneyReceived = new MoneyReceived({ amount, source, date: date || new Date() });
        await moneyReceived.save();
        res.status(201).json(moneyReceived);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 6. Archive Season
app.post('/api/archive', async (req, res) => {
    try {
        await Investment.collection.updateMany({}, { $set: { archived: true } });
        await Loan.collection.updateMany({}, { $set: { archived: true } });
        await Repayment.collection.updateMany({}, { $set: { archived: true } });
        await MoneyLent.collection.updateMany({}, { $set: { archived: true } });
        await MoneyReceived.collection.updateMany({}, { $set: { archived: true } });
        res.json({ message: 'Season archived successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. View Summary
app.get('/api/summary', async (req, res) => {
    try {
        const query = { archived: { $ne: true } };
        const investments = await Investment.find(query);
        const loans = await Loan.find(query);
        const repayments = await Repayment.find(query);
        const moneyLent = await MoneyLent.find(query);
        const moneyReceived = await MoneyReceived.find(query);

        const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
        const totalLoansTaken = loans.reduce((sum, item) => sum + item.amount, 0);
        const totalRepayments = repayments.reduce((sum, item) => sum + item.amount, 0);
        const loansRemaining = loans.reduce((sum, item) => sum + item.balance, 0);
        const totalLent = moneyLent.reduce((sum, item) => sum + item.amount, 0);
        const totalReceived = moneyReceived.reduce((sum, item) => sum + item.amount, 0);

        const cashBalance = totalReceived + totalLoansTaken - totalInvested - totalLent - totalRepayments;

        res.json({
            totalInvested,
            totalLoansTaken,
            loansRemaining,
            totalLent,
            totalReceived,
            cashBalance,
            history: {
                investments,
                loans,
                repayments,
                moneyLent,
                moneyReceived
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generic Delete
app.delete('/api/:type/:id', async (req, res) => {
    try {
        const models = { 'investments': Investment, 'loans': Loan, 'repayments': Repayment, 'money-lent': MoneyLent, 'money-received': MoneyReceived };
        const Model = models[req.params.type];
        if (!Model) return res.status(400).json({ error: 'Invalid type' });
        
        if (req.params.type === 'repayments') {
            const rep = await Repayment.findById(req.params.id);
            if (rep) {
                const loan = await Loan.findById(rep.loanId);
                if (loan) { loan.balance += rep.amount; await loan.save(); }
            }
        }
        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Generic Update
app.put('/api/:type/:id', async (req, res) => {
    try {
        const models = { 'investments': Investment, 'loans': Loan, 'repayments': Repayment, 'money-lent': MoneyLent, 'money-received': MoneyReceived };
        const Model = models[req.params.type];
        if (!Model) return res.status(400).json({ error: 'Invalid type' });

        if (req.params.type === 'repayments') {
            const oldRep = await Repayment.findById(req.params.id);
            if (oldRep && req.body.amount !== undefined) {
                const loan = await Loan.findById(oldRep.loanId);
                if (loan) {
                    loan.balance = loan.balance + oldRep.amount - Number(req.body.amount);
                    await loan.save();
                }
            }
        }
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// List loans for repayment selection
app.get('/api/loans', async (req, res) => {
    try {
        const loans = await Loan.find({ balance: { $gt: 0 }, archived: { $ne: true } });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
