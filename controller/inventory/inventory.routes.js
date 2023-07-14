const router = require('express').Router();
const inventoryController = require('./inventory.controller');

// save a new service
router.post('/save', inventoryController.save);
router.get('/show', inventoryController.show);

module.exports = router;