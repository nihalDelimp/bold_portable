const router = require('express').Router();
const inventoryCategoryController = require('./inventoryCategory.controller');

// save a new serviceinventoryController
router.post('/save', inventoryCategoryController.save);
router.get('/list', inventoryCategoryController.list);

module.exports = router;