const router = require('express').Router();
const userController = require('./user.controller');
const checkAuth = require('../../middleware/checkAuth');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save-profile', checkAuth, hasRole('USER'), userController.updateProfile);

module.exports = router;