const Loan = require('../models/Loan');

const createLoan = async (req, res, next) => {
  try {
    const { amount, lender, date, due_date } = req.body;
    const loan = await Loan.create({
      amount,
      lender,
      date: date || new Date(),
      due_date,
      balance: amount,
    });
    res.status(201).json(loan);
  } catch (error) {
    next(error);
  }
};

const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ balance: { $gt: 0 }, archived: { $ne: true } });
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    next(error);
  }
};

const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLoan,
  getLoans,
  updateLoan,
  deleteLoan,
};
