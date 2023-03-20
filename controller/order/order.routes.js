const router = require('express').Router();
const orderController = require('./order.controller');
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

// login for existing users
router.post('/create-order', checkAuth, hasRole('USER'), orderController.createOrder);

router.get('/get-user-order-details/:id', checkAuth, orderController.getOrderDetails);

router.patch('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;