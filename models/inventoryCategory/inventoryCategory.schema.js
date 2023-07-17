const mongoose = require('mongoose');

const inventoryCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);
const InventoryCategory = mongoose.model('InventoryCategory', inventoryCategorySchema);

module.exports = InventoryCategory;
