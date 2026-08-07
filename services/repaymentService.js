const updateLoanBalance = async (loan, amountChange) => {
  loan.balance = Number(loan.balance) + Number(amountChange);
  return loan.save();
};

const adjustLoanBalanceForUpdatedRepayment = async (loan, oldAmount, newAmount) => {
  const difference = Number(oldAmount) - Number(newAmount);
  loan.balance = Number(loan.balance) + difference;
  return loan.save();
};

module.exports = {
  updateLoanBalance,
  adjustLoanBalanceForUpdatedRepayment,
};
