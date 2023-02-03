const apiResponse = require("../helpers/apiResponse");
const {constant} = require('./middleware.constants');
const { Auth_error } = constant;
const hasRole = (role) => {
    return (req, res, next) => {
        if (role !== req.userData.user.user_type) {
            return apiResponse.ErrorResponse(res, Auth_error)
        }
        else {
            next();
        }
    }
}

module.exports = {
    hasRole
}