const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user/user.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const fs = require('fs');
const path = require('path');

exports.registerUsers = async (req, res) => {
    try {
        const { name, email, password, mobile, user_type } = req.body;
        console.log(req.body)
        // Check if the user with the given email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return apiResponse.ErrorResponse(res, 'User with the given email already exists');
        }
        // Create the user object
        const newUser = new User({
            name,
            email,
            password,
            mobile,
            user_type,
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    .then(user => {
                        return apiResponse.successResponse(res, user)
                    })
                    .catch(err => {
                        return apiResponse.ErrorResponse(res, err.message)
                    });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'An errorss occurred while registering the user' });
    }
};



exports.loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        if (email && password) {
            let user = await User.findOne({ email });
            if (!user) {
                return apiResponse.ErrorResponse(res, "User is not present")
            }
            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    return apiResponse.ErrorResponse(res, err)
                }
                if (result) {
                    let userData = { user };
                    const jwtPayload = userData;
                    const secret = process.env.SECRET_KEY;
                    const jwtData = {
                        expiresIn: "1d",
                    };
                    userData.token = jwt.sign(jwtPayload, secret, jwtData);
                    let { id, name, email, user_type } = userData.user;
                    let { token } = userData;
                    return apiResponse.successResponseWithData(res, "User Logged in succesfully", { user: { id, name, email, user_type }, token })
                }
                else {
                    return apiResponse.ErrorResponse(res, "Not a valid password")
                }
            })
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)

    }
}

exports.specificUserDetails = async (req, res) => {
    try {
        const _id = req.params.id;
        User.findOne({ _id }).then(data => {
            return apiResponse.successResponseWithData(res, "data", data)
        })
            .catch(err => {
                return apiResponse.ErrorResponse(res, "No such user present")
            })
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)
    }
}


exports.getListAllUsers = async (req, res) => {
    try {
        await User.find({ user_type: { $ne: 'ADMIN' } }).sort({ createdAt: 1 }).limit(10).then(data => {
            return apiResponse.successResponseWithData(res, "Data retrieved successfully", data)
        })
            .catch(err => {
                return apiResponse.ErrorResponse(res, "Some Error Occurs")
            })
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)

    }
}


exports.updateProfile = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const { name } = req.body;
        const filter = { _id };
        const update = { name };
        const options = { new: true };

        await User.findOneAndUpdate(filter, update, options)
            .then(updatedUser => {
                // Handle the updated user object here
                return apiResponse.successResponseWithData(res, "Data updated", updatedUser)
            })
            .catch(err => {
                // Handle the error here
                return apiResponse.ErrorResponse(res, "Profile not updated")
            });

    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message)

    }
}

exports.updateProfileImage = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        if (req.file === undefined) {
            return apiResponse.ErrorResponse(res, "No file Found");
        }

        const user = await User.findById(_id);
        if (!user) {
            return apiResponse.notFoundResponse(res, "User not found");
        }

        // delete old profile picture file if it exists
        if (user.profile_picture) {
            fs.unlink(user.profile_picture, (err) => {
                if (err) {
                    logger.log("error", { fileName: path.basename(__filename), message: err.message });
                }
            });
        }

        // update user's profile picture
        user.profile_picture = req.file.path;
        const updateUser = await user.save();
        if (updateUser) {
            logger.log("info", { fileName: path.basename(__filename), message: 'File uploaded Successfully' });
            return apiResponse.successResponseWithData(res, "User image uploaded successfully", updateUser);
        } else {
            logger.log("warn", { fileName: path.basename(__filename), message: 'Failed to update user profile picture' });
            return apiResponse.ErrorResponse(res, "Failed to update user profile picture");
        }
    } catch (error) {
        logger.log("error", { fileName: path.basename(__filename), message: error.message });
        return apiResponse.ErrorResponse(res, error.message);
    }
}