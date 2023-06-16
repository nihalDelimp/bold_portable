const mongoose = require('mongoose');

const userServicesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        quotationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'quotationType'
        },
        quotationType: {
            type: String,
            required: true,
            enum: ['Construction', 'DisasterRelief', 'FarmOrchardWinery', 'PersonalOrBusiness', 'Event']
        },
        mobile: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
            // select: false   Will look into this how to handle this
        },
        user_type: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER'
        },
        privacy_acceptance: {
            type: Boolean,
            required: false
        },
        stripe_customer_id: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const UserServices = mongoose.model('UserServices', userServicesSchema);

module.exports = UserServices;
