const User = require('../../models/user/user.schema');
const apiResponse = require("../../helpers/apiResponse");
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res) => {
    try {
        const { _id } = req.userData.user;
        const { name, mobile, password } = req.body;

        let update = { name, mobile };

        // Hash the new password if it exists
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            update.password = hashedPassword;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id },
            update,
            { new: true }
        );

        if (updatedUser) {
            return apiResponse.successResponseWithData(res, "Data updated", updatedUser);
        } else {
            return apiResponse.ErrorResponse(res, "Profile not updated");
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }

};

exports.updateProfileImage = async (req, res) => {
    try {
        const { _id } = req.userData.user;

        if (!req.file) {
            return apiResponse.ErrorResponse(res, "No file found");
        }

        const user = await User.findById(_id);

        if (!user) {
            return apiResponse.notFoundResponse(res, "User not found");
        }

        // Delete old profile picture file if it exists
        if (user.profile_picture) {
            await fs.unlink(user.profile_picture).catch(err => {
                console.error("Failed to delete old profile picture file:", err);
            });
        }

        // Update user's profile picture
        user.profile_picture = req.file.path;
        const updatedUser = await user.save();

        if (updatedUser) {
            console.log("File uploaded successfully");
            return apiResponse.successResponseWithData(res, "User image uploaded successfully", updatedUser);
        } else {
            console.warn("Failed to update user profile picture");
            return apiResponse.ErrorResponse(res, "Failed to update user profile picture");
        }
    } catch (error) {
        console.error("Error updating profile image:", error);
        return apiResponse.ErrorResponse(res, error.message);
    }
};


