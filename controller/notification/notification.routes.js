const router = require('express').Router();
const notificationController = require('./notification.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Get all unseen Status
router.get('/get-all-unseen-notfications', checkAuth, hasRole('ADMIN'), notificationController.getUnseenNotifications);

//update all notification to true
router.put('/mark-all-notfications-true', checkAuth, hasRole('ADMIN'), notificationController.markAllNotificationsAsSeen);

//update specific notification to true
router.patch('/:id/mark-specific-notification-as-seen', checkAuth, hasRole('ADMIN'), notificationController.markSpecificNotificationsAsSeen);

module.exports = router;