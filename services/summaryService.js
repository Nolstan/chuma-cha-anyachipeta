const buildSummary = async ({ Investment, Loan, Repayment, MoneyLent, MoneyReceived, TenantAdvance }) => {
  const query = { archived: { $ne: true } };

  const [investments, loans, repayments, moneyLent, moneyReceived, tenantAdvances] = await Promise.all([
    Investment.find(query),
    Loan.find(query),
    Repayment.find(query),
    MoneyLent.find(query),
    MoneyReceived.find(query),
    TenantAdvance.find(query),
  ]);

  const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalLoansTaken = loans.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRepayments = repayments.reduce((sum, item) => sum + Number(item.amount), 0);
  const loansRemaining = loans.reduce((sum, item) => sum + Number(item.balance), 0);
  const totalLent = moneyLent.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalReceived = moneyReceived.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalTenantAdvances = tenantAdvances.reduce((sum, item) => sum + Number(item.amount), 0);

  const tenantBreakdown = {};
  tenantAdvances.forEach((adv) => {
    const name = adv.tenantName ? adv.tenantName.trim().toUpperCase() : 'UNKNOWN';
    tenantBreakdown[name] = (tenantBreakdown[name] || 0) + Number(adv.amount);
  });

  const cashBalance = totalReceived + totalLoansTaken - totalInvested - totalLent - totalRepayments;

  return {
    totalInvested,
    totalLoansTaken,
    loansRemaining,
    totalLent,
    totalReceived,
    totalTenantAdvances,
    tenantBreakdown,
    cashBalance,
    history: {
      investments,
      loans,
      repayments,
      moneyLent,
      moneyReceived,
      tenantAdvances,
    },
  };
};

module.exports = {
  buildSummary,
};
