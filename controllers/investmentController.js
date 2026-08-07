const Investment = require('../models/Investment');

const createInvestment = async (req, res, next) => {
  try {
    const { amount, category, date } = req.body;
    const investment = await Investment.create({ amount, category, date: date || new Date() });
    res.status(201).json(investment);
  } catch (error) {
    next(error);
  }
};

const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json(investment);
  } catch (error) {
    next(error);
  }
};

const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvestment,
  updateInvestment,
  deleteInvestment,
};
