const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        product_image_type: {
            type: String,
            required: true
        },
        product_image: {
            type: String,
            required: true
        },
        product_price: {
            type: Number,
            required: true
        }
    }
);
const User = mongoose.model('Product', productSchema);

module.exports = User;
