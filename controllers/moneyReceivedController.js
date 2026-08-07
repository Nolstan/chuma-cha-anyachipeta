const MoneyReceived = require('../models/MoneyReceived');

const createMoneyReceived = async (req, res, next) => {
  try {
    const { amount, source, date } = req.body;
    const moneyReceived = await MoneyReceived.create({ amount, source, date: date || new Date() });
    res.status(201).json(moneyReceived);
  } catch (error) {
    next(error);
  }
};

const updateMoneyReceived = async (req, res, next) => {
  try {
    const moneyReceived = await MoneyReceived.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!moneyReceived) {
      return res.status(404).json({ error: 'Money received record not found' });
    }
    res.json(moneyReceived);
  } catch (error) {
    next(error);
  }
};

const deleteMoneyReceived = async (req, res, next) => {
  try {
    const moneyReceived = await MoneyReceived.findByIdAndDelete(req.params.id);
    if (!moneyReceived) {
      return res.status(404).json({ error: 'Money received record not found' });
    }
    res.json({ message: 'Money received record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMoneyReceived,
  updateMoneyReceived,
  deleteMoneyReceived,
};
