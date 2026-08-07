const express = require('express');
const { createMoneyReceived, updateMoneyReceived, deleteMoneyReceived } = require('../controllers/moneyReceivedController');

const router = express.Router();

router.post('/', createMoneyReceived);
router.put('/:id', updateMoneyReceived);
router.delete('/:id', deleteMoneyReceived);

module.exports = router;
