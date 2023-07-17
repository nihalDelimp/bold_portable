const router = require('express').Router();
const inventoryCategoryController = require('./inventoryCategory.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
// save a new serviceinventoryController
router.post('/save-category-and-type', checkAuth, hasRole('ADMIN'), inventoryCategoryController.saveCategoryAndType);
router.get('/get-complete-list', inventoryCategoryController.getCompleteDetails);

module.exports = router;