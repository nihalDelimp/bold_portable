const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        profile_picture: {
            type: String,
            required: false
        },
        mobile: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        user_type: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER'
        },
        privacy_acceptance: {
            type: Boolean,
            required: false
        }
    },
    {
        timestamps: true
    }
);
const User = mongoose.model('User', userSchema);

module.exports = User;
