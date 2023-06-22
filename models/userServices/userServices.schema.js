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
            enum: ['construction', 'disaster-relief', 'personal-or-business', 'farm-orchard-winery', 'event']
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        coordinates: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] }
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'resolved'],
            default:'pending'
        }
    },      
    {
        timestamps: true
    }
);

const UserServices = mongoose.model('UserServices', userServicesSchema);

module.exports = UserServices;
