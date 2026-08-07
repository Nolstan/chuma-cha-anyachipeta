const MoneyLent = require('../models/MoneyLent');

const createMoneyLent = async (req, res, next) => {
  try {
    const { amount, person, date, expectedReturnDate } = req.body;
    const moneyLent = await MoneyLent.create({
      amount,
      person,
      date: date || new Date(),
      expectedReturnDate,
    });
    res.status(201).json(moneyLent);
  } catch (error) {
    next(error);
  }
};

const updateMoneyLent = async (req, res, next) => {
  try {
    const moneyLent = await MoneyLent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!moneyLent) {
      return res.status(404).json({ error: 'Money lent record not found' });
    }
    res.json(moneyLent);
  } catch (error) {
    next(error);
  }
};

const deleteMoneyLent = async (req, res, next) => {
  try {
    const moneyLent = await MoneyLent.findByIdAndDelete(req.params.id);
    if (!moneyLent) {
      return res.status(404).json({ error: 'Money lent record not found' });
    }
    res.json({ message: 'Money lent record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMoneyLent,
  updateMoneyLent,
  deleteMoneyLent,
};
