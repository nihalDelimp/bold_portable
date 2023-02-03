const router = require('express').Router();
const authController = require('./auth.controller');
const { userValidationRules, loginValidationRules, passwordValidationRules, nameValidationRules } = require('./auth.schema')
const { validate } = require("../../validators/validate")
const checkAuth = require('../../middleware/checkAuth');

// login for existing users
router.post('/login', loginValidationRules(), validate, authController.loginUser);

//register a new user
router.post('/register', userValidationRules(), validate, authController.registerUsers);

//get the list of all user
router.get('/get-all-users', authController.getRegisteredUsers)

module.exports = router;