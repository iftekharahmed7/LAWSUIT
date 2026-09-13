const express = require('express');
const router = express.Router();
const { getAllNews, addNews } = require('../controllers/legalNewsController');

router.get('/', getAllNews);
router.post('/', addNews);

module.exports = router;
