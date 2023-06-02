const router = require('express').Router();
const contactController = require('./contacts.controller');

// save a new service
router.post('/save', contactController.save);

module.exports = router;