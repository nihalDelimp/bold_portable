const router = require('express').Router();
const quotationsController = require('./quotations.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Create Quotation for users
router.post('/create-specific-quotation-for-user', checkAuth, hasRole('USER'), quotationsController.createSpecificQuotation);
// router.post('/create-event-quotation-for-user', checkAuth, hasRole('USER'), quotationsController.createSpecificQuotation);

module.exports = router;