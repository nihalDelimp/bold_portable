const User = require('../models/user/user.schema');
const mailer = require('./nodemailer');
const bcrypt = require('bcrypt');

function generateRandomPassword(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
  
    return result;
}

  
exports.createUser = async (userData) => {
    try {
        const { name, email, cellNumber } = userData;
        const tempPassword = generateRandomPassword(8);
        // Hash the temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Set your password',
            text: `Hi ${name},\n\nYour username is ${email}, and temprory password is ${tempPassword}. You may reset your password by logging in to account\n\nThanks,\nBold Portable Team`
        };

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return { error: false, message: "User exist", user: existingUser };
        }

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
        if (error.code === 11000 && error.keyPattern) {
            const fields = Object.keys(error.keyPattern).join(', ');
            return { error: true, message: `Duplicate key error. The combination of ${fields} already exists.` };
        }
        return { error: true, message: error.message };
    }
};