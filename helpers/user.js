const User = require('../models/user/user.schema');
const mailer = require('./nodemailer');
const bcrypt = require('bcrypt');

exports.createUser = async (userData) => {
    try {
        const { name, email, cellNumber } = userData;
        // Check if the user with the given email already exists
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return apiResponse.ErrorResponse(res, 'User with the given email already exists');
        // }
        // Create the user object

        // Compose the email
        const mailOptions = {
            from: 'hello@boldportable.com',
            to: email,
            subject: 'Set your password',
            text: `Hi ${name},\n\nYour username is ${email}, and temprory password is 12345678. You may reset your password by logging in to account\n\nThanks,\nBold Portable Team`
        };

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash('12345678', salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile: cellNumber,
            user_type: 'USER'
        });

        const createdUser = await newUser.save();

        if (createdUser) {
            mailer.sendMail(mailOptions);

            return { error: false, message: "User created", user: newUser };
        } else {
            return { error: true, message: 'User not created' };
        }        
    } catch (error) {
        return { error: true, error: error.message };
    }
};