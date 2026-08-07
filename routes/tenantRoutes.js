const express = require('express');
const { createTenant, getTenants, updateTenant, deleteTenant } = require('../controllers/tenantController');

const router = express.Router();

router.post('/', createTenant);
router.get('/', getTenants);
router.put('/:id', updateTenant);
router.delete('/:id', deleteTenant);

module.exports = router;
