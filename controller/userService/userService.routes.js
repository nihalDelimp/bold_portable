const router = require('express').Router();
const userServiceController = require('./userService.controller');
const checkAuth = require('../../middleware/checkAuth');
const upload = require('../../helpers/multer');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save', checkAuth, hasRole('USER'), upload.array('service_image', 3), userServiceController.save);
router.get('/list', checkAuth, hasRole('ADMIN'), userServiceController.getAllUserServices);

module.exports = router;