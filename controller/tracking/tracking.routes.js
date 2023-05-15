const router = require('express').Router();
const trackingController = require('./tracking.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save-tracking', checkAuth, hasRole('ADMIN'), trackingController.saveTracking);

module.exports = router;