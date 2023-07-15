const router = require('express').Router();
const inventoryController = require('./inventory.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');
// save a new service
router.post('/save', checkAuth, hasRole('ADMIN'), inventoryController.saveNewGeneratedQrCOde);
router.get('/show', inventoryController.getQrCodeDetails);
router.post('/assign-qrcode-to-quote', checkAuth, hasRole('ADMIN'), inventoryController.assignQrCodeToQuote);
router.get('/get-qr-code-details-status', inventoryController.getQrCodesByStatus);
router.get('/getQrCodesByQuotation/:quoteId/:quoteType', checkAuth, hasRole('ADMIN'), inventoryController.getQrCodesByQuotation);
router.post('/revertQrCodeValue', checkAuth, hasRole('ADMIN'), inventoryController.revertQrCodeValue);

module.exports = router;