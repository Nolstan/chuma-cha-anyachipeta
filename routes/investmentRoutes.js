const express = require('express');
const { createInvestment, updateInvestment, deleteInvestment } = require('../controllers/investmentController');

const router = express.Router();

router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

module.exports = router;
