const router = require('express').Router();
const subscriptionsController = require('./subscriptions.controller');
// const checkAuth = require('../../middleware/checkAuth');
// const { hasRole, hasMultipleRole } = require('../../middleware/checkRole');

router.post('/create-subscriptions', subscriptionsController.createSubscription);

module.exports = router;