const router = require('express').Router();
const notificationController = require('./notification.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

//Get all unseen Status
router.get('/get-all-unseen-notfications', checkAuth, hasRole('ADMIN'), notificationController.getUnseenNotifications);

//Get Cancel Order Notifications
router.get('/get-cancel-order-notfications', checkAuth, hasRole('USER'), notificationController.getCancelOrderNotifications);

//Get Specific Cancel Order Notifications
router.get('/get-specific-cancel-order-notfications', checkAuth, hasRole('USER'), notificationController.getSpecificCancelOrderNotifications);

//Get Specific unseen Status
router.get('/get-specific-unseen-notfications/:id', checkAuth, hasRole('ADMIN'), notificationController.getSpecificUnseenNotificationsDeatils);

//update all notification to true
router.put('/mark-all-notfications-true', checkAuth, hasRole('ADMIN'), notificationController.markAllNotificationsAsSeen);

//update all specific user notification to true
router.put('/mark-all-user-notfications-true', checkAuth, hasRole('USER'), notificationController.markUserAllNotificationsAsSeen);


//update specific notification to true
router.patch('/:id/mark-specific-notification-as-seen', checkAuth, hasRole('ADMIN'), notificationController.markSpecificNotificationsAsSeen);

module.exports = router;