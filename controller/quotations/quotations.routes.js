const router = require('express').Router();
const quotationsController = require('./quotations.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Create Quotation for Constructions.
router.post('/create-quotation-for-construction', checkAuth, hasRole('USER'), quotationsController.createConstructionQuotation);

//Create Quotation for Disaster Relief.
router.post('/create-quotation-for-disaster-relief', checkAuth, hasRole('USER'), quotationsController.createDisasterReliefQuotation);

//Create Quotation for Personal Business Site.
router.post('/create-quotation-for-personal-business-site', checkAuth, hasRole('USER'), quotationsController.createPersonalOrBusinessQuotation);

module.exports = router;