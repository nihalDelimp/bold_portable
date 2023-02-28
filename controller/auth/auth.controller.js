const apiResponse = require("../../helpers/apiResponse");
const jwt = require("jsonwebtoken");
const logger = require("../../helpers/logger");
const bcrypt = require('bcrypt-nodejs');
var path = require('path');
const { createUser, getUser, getAllUsers } = require('./auth.services')
const db = require('../../models/index');
const { constants } = require('./auth.constants');
const { User_exists, Data_not_deleted_error, User_not_exists, Not_valid_Password, Data_not_deleted, Class_not_exists, Logged_in, Data_created, Data_not_updated, Data_Deleted, Data_updated, Some_error } = constants
const User = db.user;

//create new users
exports.registerUsers = async (req, res, next) => {
    try {
        const user = await getUser({ email: req.body.email });
        const { name, email, password, mobile} = req.body;
        console.log(mobile)
        if (user) {
            return apiResponse.ErrorResponse(res, User_exists);
        }
        bcrypt.hash(req.body.password, null, null, (err, hash) => {
            createUser(
                {
                    name,
                    email,
                    password: hash,
                    mobile
                }
            ).then(async user => {
                let userData = { user };
                const jwtPayload = userData;
                const secret = process.env.SECRET_KEY;
                const jwtData = {
                    expiresIn: "1d",
                };
                userData.token = jwt.sign(jwtPayload, secret, jwtData);
                let { token } = userData;
                logger.log("info", { fileName: path.basename(__filename), message: "User registered successfully...!!" });
                return apiResponse.successResponseWithData(res, Logged_in, { user: userData.user, token })
            }).catch(err => {
                logger.log("warn", { fileName: path.basename(__filename), message: Some_error });
                return apiResponse.ErrorResponseWithData(res, Some_error, err.message)
            })
        })
    }
    catch (err) {
        //throw error in json response with status 500.
        logger.error(err);
        return apiResponse.ErrorResponse(res, err.message);
    }
};

//Login for users
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (email && password) {
            let user = await getUser({ email });
            if (!user) {
                return apiResponse.ErrorResponse(res, User_not_exists)
            }
            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    return apiResponse.ErrorResponse(res, Not_valid_Password)
                }
                if (result) {
                    let userData = { user };
                    const jwtPayload = userData;
                    const secret = process.env.SECRET_KEY;
                    const jwtData = {
                        expiresIn: "1d",
                    };
                    userData.token = jwt.sign(jwtPayload, secret, jwtData);
                    let { token } = userData;
                    logger.log("info", { fileName: path.basename(__filename), mesage: "Logged in succesfully" });
                    return apiResponse.successResponseWithData(res, Logged_in, { user: userData.user, token })
                }
                else {
                    logger.log("warn", { fileName: path.basename(__filename), mesage: Not_valid_Password });
                    return apiResponse.ErrorResponse(res, Not_valid_Password)
                }
            })
        }
    } catch (error) {
        logger.error(error);
        return apiResponse.ErrorResponse(res, error.message)
    }
}


// get the list of all registered Users

exports.getRegisteredUsers = async (req, res) => {
    try {
        await getAllUsers().then(user => {
            if (user) {
                return apiResponse.successResponseWithData(res, "User List", user, user.length)
            }
            else {
                return apiResponse.ErrorResponse(res, "No User Exist")

            }
        }
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }

};

//update user Profile
exports.updateUsersProfile = async (req, res, next) => {
    try {
        const { id } = req.userData.user;
        const { name } = req.body;
        if (id) {
            await User.update(
                {
                    name
                }, { where: { id } },
            )
                .then(num => {
                    if (num <= 1) {
                        return apiResponse.successResponse(res, Data_updated)
                    } else {
                        return apiResponse.ErrorResponse(res, Data_not_updated)
                    }
                }
                ).catch(err => {
                    return apiResponse.ErrorResponse(err, Some_error)
                });
        }
    }
    catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
}


//Delete user Profile
exports.deleteUserProfile = async (req, res) => {
    try {
        const id = req.params.id;
        if (id) {
            User.destroy({
                where: { id: req.params.id }
            }).then(num => {
                if (num == 1) {
                    res.send({
                        status: 1,
                        message: Data_Deleted
                    });
                } else {
                    res.send({
                        status: 0,
                        message: Data_not_deleted
                    });
                }
            })
                .catch(err => {
                    res.status(500).send({
                        status: 0,
                        message: Data_not_deleted_error
                    });
                });
        }
        else {
            return apiResponse.ErrorResponse(res, error.message)
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
}

//Update user Password
exports.updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        // if (password === confirm_password) {
        let user_data = await User.findOne({ where: { id } });
        if (user_data) {
            bcrypt.hash(password, null, null, async (err, hash) => {
                await User.update({
                    password: hash,
                    is_approved: 'Y'
                }, { where: { id } }).then(num => {
                    console.log(num)
                    if (num <= 1) {
                        return apiResponse.successResponse(res, Data_updated)
                    } else {
                        return apiResponse.ErrorResponse(res, Data_not_updated)
                    }
                }
                ).catch(err => {
                    return apiResponse.ErrorResponse(err, Some_error)
                });
            });
        }
        else {
            return apiResponse.ErrorResponse(res, "No such user Found")
        }
        // }
        // else {
        //     return apiResponse.ErrorResponse(res, "Password mismatched.!")
        // }

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
}