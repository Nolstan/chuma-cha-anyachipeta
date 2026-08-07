const express = require('express');
const { createTenantAdvance, updateTenantAdvance, deleteTenantAdvance } = require('../controllers/tenantAdvanceController');

const router = express.Router();

router.post('/', createTenantAdvance);
router.put('/:id', updateTenantAdvance);
router.delete('/:id', deleteTenantAdvance);

module.exports = router;
