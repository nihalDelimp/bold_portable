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
        price: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        quote_type: {
            type: String,
            default: null
        },
        quote_id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'quote_type'
        },
        qrCode: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);
const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
