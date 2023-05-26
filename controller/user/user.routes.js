const router = require('express').Router();
const userController = require('./user.controller');
const checkAuth = require('../../middleware/checkAuth');
const upload = require('../../helpers/multer');
const { hasRole } = require('../../middleware/checkRole');

router.post('/save-profile', checkAuth, hasRole('USER'), userController.updateProfile);
router.post('/save-image', checkAuth, hasRole('USER'), upload.single("profile_picture"), userController.updateProfileImage);

module.exports = router;