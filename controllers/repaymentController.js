const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');
const { updateLoanBalance, adjustLoanBalanceForUpdatedRepayment } = require('../services/repaymentService');

const createRepayment = async (req, res, next) => {
  try {
    const { loanId, amount, date } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const repayment = await Repayment.create({
      loanId,
      amount,
      date: date || new Date(),
      lender: loan.lender,
    });

    await updateLoanBalance(loan, -amount);
    res.status(201).json({ repayment, remainingBalance: loan.balance });
  } catch (error) {
    next(error);
  }
};

const updateRepayment = async (req, res, next) => {
  try {
    const existingRepayment = await Repayment.findById(req.params.id);
    if (!existingRepayment) {
      return res.status(404).json({ error: 'Repayment not found' });
    }

    const loan = await Loan.findById(existingRepayment.loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const updatedRepayment = await Repayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await adjustLoanBalanceForUpdatedRepayment(loan, existingRepayment.amount, updatedRepayment.amount);

    res.json(updatedRepayment);
  } catch (error) {
    next(error);
  }
};

const deleteRepayment = async (req, res, next) => {
  try {
    const repayment = await Repayment.findById(req.params.id);
    if (!repayment) {
      return res.status(404).json({ error: 'Repayment not found' });
    }

    const loan = await Loan.findById(repayment.loanId);
    if (loan) {
      await updateLoanBalance(loan, Number(repayment.amount));
    }

    await Repayment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Repayment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRepayment,
  updateRepayment,
  deleteRepayment,
};
