const router = require('express').Router();
const quotationsController = require('./quotations.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole, hasMultipleRole } = require('../../middleware/checkRole');

//Create Quotation for Constructions.
router.post('/create-quotation-for-construction', quotationsController.createConstructionQuotation);

//Update Quotation for Constructions.
router.put('/update-quotation-for-construction/:constructionId', checkAuth, hasRole('ADMIN'), quotationsController.updateConstructionQuotation);

//Create Quotation for Disaster Relief.
router.post('/create-quotation-for-disaster-relief', checkAuth, hasRole('USER'), quotationsController.createDisasterReliefQuotation);

//Update Quotation for Disaster Relief.
router.put('/update-quotation-for-disaster-relief/:disasterReliefId', checkAuth, hasRole('ADMIN'), quotationsController.updateDisasterReliefQuotation);

//Create Quotation for Personal Business Site.
router.post('/create-quotation-for-personal-business-site', checkAuth, hasRole('USER'), quotationsController.createPersonalOrBusinessQuotation);

//Update Quotation for Personal Business Site.
router.put('/update-quotation-for-personal-business-site/:personalOrBusinessId', checkAuth, hasRole('ADMIN'), quotationsController.updatePersonalOrBusinessQuotation);

//Create Quotation for Farm Orchard Winery.
router.post('/create-quotation-for-farm-orchard-winery', checkAuth, hasRole('USER'), quotationsController.createFarmOrchardWineryQuotation);

//Update Quotation for Farm Orchard Winery.
router.put('/update-quotation-for-farm-orchard-winery/:farmOrchardWineryId', checkAuth, hasRole('ADMIN'), quotationsController.updateFarmOrchardWineryQuotation);

//Create Quotation for Event.
router.post('/create-quotation-for-event', checkAuth, hasRole('USER'), quotationsController.createEventQuotation);

//Update Quotation for Farm Orchard Winery.
router.put('/update-quotation-for-event/:eventId', checkAuth, hasRole('ADMIN'), quotationsController.updateEventQuotation);

//Get All Quotation of Users.
router.get('/get-quotation-of-user/:quotationType', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotation);

//Get All Quotation for Specific Users.
router.get('/get-quotation-for-specific-user', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotationForUsers);

//Get All Quotation from All collection.
router.get('/get-quotation-from-all-collection', checkAuth, hasMultipleRole(['USER', 'ADMIN']), quotationsController.getAllQuotationForUsers);

//Get a Specific Quotation from All collection.
router.post('/get-specific-quotation-from-all-collection', checkAuth,  hasMultipleRole(['USER', 'ADMIN']), quotationsController.getSpefcificQuotationQuoteId);

module.exports = router;