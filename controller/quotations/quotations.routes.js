const router = require('express').Router();
const quotationsController = require('./quotations.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole, hasMultipleRole } = require('../../middleware/checkRole');

//Create Quotation for Constructions.
router.post('/create-quotation-for-construction', checkAuth, hasRole('USER'), quotationsController.createConstructionQuotation);

//Create Quotation for Disaster Relief.
router.post('/create-quotation-for-disaster-relief', checkAuth, hasRole('USER'), quotationsController.createDisasterReliefQuotation);

//Create Quotation for Personal Business Site.
router.post('/create-quotation-for-personal-business-site', checkAuth, hasRole('USER'), quotationsController.createPersonalOrBusinessQuotation);

//Create Quotation for Farm Orchard Winery.
router.post('/create-quotation-for-farm-orchard-winery', checkAuth, hasRole('USER'), quotationsController.createFarmOrchardWineryQuotation);

//Create Quotation for Event.
router.post('/create-quotation-for-event', checkAuth, hasRole('USER'), quotationsController.createEventQuotation);

//Get All Quotation of Users.
router.get('/get-quotation-of-user/:quotationType', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotation);

//Get All Quotation for Specific Users.
router.get('/get-quotation-for-specific-user/:quotationType', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotationForUsers);

//Get All Quotation from All collection.
router.get('/get-quotation-from-all-collection/:quotationType', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotationForUsers);

module.exports = router;