const express = require('express');
const { archiveSeason } = require('../controllers/archiveController');

const router = express.Router();

router.post('/', archiveSeason);

module.exports = router;
