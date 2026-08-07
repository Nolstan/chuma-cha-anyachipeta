const express = require('express');
const { createRepayment, updateRepayment, deleteRepayment } = require('../controllers/repaymentController');

const router = express.Router();

router.post('/', createRepayment);
router.put('/:id', updateRepayment);
router.delete('/:id', deleteRepayment);

module.exports = router;
