const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Repayment = require('../models/Repayment');
const MoneyLent = require('../models/MoneyLent');
const MoneyReceived = require('../models/MoneyReceived');
const TenantAdvance = require('../models/TenantAdvance');
const Tenant = require('../models/Tenant');
const { archiveAllSeason } = require('../services/archiveService');

const archiveSeason = async (req, res, next) => {
  try {
    await archiveAllSeason({
      Investment,
      Loan,
      Repayment,
      MoneyLent,
      MoneyReceived,
      TenantAdvance,
      Tenant,
    });

    res.json({ message: 'Season archived successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  archiveSeason,
};
