const router = require('express').Router();
const adminEmailController = require('./adminEmail.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

router.post('/send', checkAuth, hasRole('ADMIN'), adminEmailController.send);

module.exports = router;