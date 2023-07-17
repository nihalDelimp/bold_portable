const mongoose = require('mongoose');

const inventoryManagementSchema = new mongoose.Schema(
    {

        category: {
            type: [String],
            default: [],
        },
        types: {
            type: [String],
            default: [],
        }
    },
    { timestamps: true }
);

const Inventory_management = mongoose.model('Inventory_management', inventoryManagementSchema);

module.exports = Inventory_management;
