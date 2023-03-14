const router = require('express').Router();
const authController = require('./auth.controller');
const { userValidationRules, loginValidationRules, passwordValidationRules, nameValidationRules } = require('./auth.schema')
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');

// login for existing users
router.post('/login', loginValidationRules(), validate, authController.loginUser);

//register a new user
router.post('/register', userValidationRules(), validate, authController.registerUsers);

///Get specific User Details
router.get('/get-specific-user', authController.specificUserDetails);

//get the list of all user
router.get('/get-all-users', authController.getListAllUsers)

//update User profile
router.post('/update-user-profile', checkAuth, authController.updateProfile)

module.exports = router;