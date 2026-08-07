const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const MoneyLent = require('../models/MoneyLent');
const MoneyReceived = require('../models/MoneyReceived');
const TenantAdvance = require('../models/TenantAdvance');
const { buildSummary } = require('../services/summaryService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await buildSummary({
      Investment,
      Loan,
      Repayment,
      MoneyLent,
      MoneyReceived,
      TenantAdvance,
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
