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

