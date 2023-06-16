const mongoose = require('mongoose');

const userServicesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        service: {
            type: String,
            required: true
        },
        serviceTypes: {
            type: Array,
            required: true,
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
        }
    },
    {
        timestamps: true
    }
);

const UserServices = mongoose.model('UserServices', userServicesSchema);

module.exports = UserServices;
