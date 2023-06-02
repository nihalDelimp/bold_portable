const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        fullName: String,
        phone: String,
        postalCode: String,
        email: String,
        subject: String,
        message: String,
    },
    { timestamps: true }
);
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
