const express = require('express');
const { createLoan, getLoans, updateLoan, deleteLoan } = require('../controllers/loanController');

const router = express.Router();

router.post('/', createLoan);
router.get('/', getLoans);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

module.exports = router;
