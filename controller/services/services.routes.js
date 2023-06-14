const router = require('express').Router();
const serviceController = require('./services.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

// save a new service
router.post('/save', checkAuth, hasRole('ADMIN'), serviceController.save);
router.get('/list', serviceController.getAllServices);

module.exports = router;