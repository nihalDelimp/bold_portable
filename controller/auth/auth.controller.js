const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user/user.schema');
const apiResponse = require("../../helpers/apiResponse");
const logger = require("../../helpers/logger");
const fs = require('fs');
const path = require('path');
const mailer = require("../../helpers/nodemailer");
const PasswordVerification = require('../../models/passwordVerification/passwordVerification.schema');

exports.registerUsers = async (req, res) => {
    try {
        const { name, email, password, mobile, user_type } = req.body;
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
        passport.authenticate('local', {session: false}, (err, user, info) => {
            console.log(err);
            if (err || !user) {

                return apiResponse.ErrorResponse(res, info ? info.message : 'Login failed',)
            }
    
            req.login(user, {session: false}, (err) => {
                if (err) {
                    res.send(err);
                }
    
                let userData = { user };
                const jwtPayload = userData;
                const secret = process.env.SECRET_KEY;
                const jwtData = {
                    expiresIn: "1d",
                };
                userData.token = jwt.sign(jwtPayload, secret, jwtData);
                let { _id, name, email, user_type, mobile } = userData.user;
                let { token } = userData;
                
                return apiResponse.successResponseWithData(res, "User Logged in succesfully", { user: { _id, name, email, user_type, mobile }, token })
            });
        })
        (req, res);
        
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments({ user_type: { $ne: 'ADMIN' } });
        const totalPages = Math.ceil(total / limit);

        const users = await User.find({ user_type: { $ne: 'ADMIN' } })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        return apiResponse.successResponseWithData(res, "Data retrieved successfully", { users, totalPages, total, currentPage: page });
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};



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

function generateOTP(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
  
    return result;
}

exports.sendOtp = async (req, res) => {
    try {

        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return apiResponse.notFoundResponse(res, "User not found");
        }

        const otp = generateOTP(6);

        const passwordVerification = new PasswordVerification({
            user: user._id.toString(),
            otp: otp,
            expiryOn: new Date().setHours(new Date().getHours() + 48)
        });

        await passwordVerification.save();
        
        const mailOptions = {
            from: 'hello@boldportable.com',
            to: req.body.email,
            subject: 'OTP to reset your password',
            text: `Hi ${user.name},\n\nThe OTP to reset your password is ${otp} \n\nThanks,\nBold Portable Team`
        };
        
        mailer.sendMail(mailOptions);

        return apiResponse.successResponseWithData(res, 'OTP sent successfully', user);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password, confirm_password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return apiResponse.notFoundResponse(res, 'User not found');
        }

        // Find the corresponding password verification entry
        const passwordVerification = await PasswordVerification.findOne({
            user: user._id.toString(),
            otp,
            expiryOn: { $gt: new Date() }, // Verify that the OTP is not expired
            status: 'pending', // Verify that the status is 'pending'
        });
        if (!passwordVerification) {
            return apiResponse.validationErrorWithData(res, 'Invalid OTP');
        }

        // Verify that the password and confirm_password match
        if (password !== confirm_password) {
            return apiResponse.validationErrorWithData(res, "Passwords don't match");
        }

        // Check if the OTP has expired
        if (passwordVerification.expiryOn <= new Date()) {
            // Update the status to 'expired'
            passwordVerification.status = 'expired';
            await passwordVerification.save();
            return apiResponse.validationErrorWithData(res, 'OTP has expired');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the status to 'verified'
        passwordVerification.status = 'verified';
        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Update all other records associated with the user to 'expired'
        await PasswordVerification.updateMany(
            {
                user: user._id.toString(),
                status: 'pending',
            },
            {
                $set: { status: 'expired' },
            }
        );

        // Save the updated password verification entry
        await passwordVerification.save();

        return apiResponse.successResponse(res, 'Password reset successfully');
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
};

