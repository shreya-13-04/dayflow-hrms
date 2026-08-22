const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/insights', protect, authorize('ADMIN', 'HR'), getInsights);

module.exports = router;
