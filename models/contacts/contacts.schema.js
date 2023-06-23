const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        phone: String,
        message: String,
        feedback: String
    },
    { timestamps: true }
);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
