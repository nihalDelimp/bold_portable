const router = require('express').Router();
const serviceController = require('./services.controller');

// save a new service
router.post('/save', serviceController.save);

module.exports = router;