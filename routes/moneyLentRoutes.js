const express = require('express');
const { createMoneyLent, updateMoneyLent, deleteMoneyLent } = require('../controllers/moneyLentController');

const router = express.Router();

router.post('/', createMoneyLent);
router.put('/:id', updateMoneyLent);
router.delete('/:id', deleteMoneyLent);

module.exports = router;
