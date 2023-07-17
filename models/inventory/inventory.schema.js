const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        category: {
            type: [String],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        qrCodeValue: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: false
        },
        qrCode: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        },
    },
    { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
