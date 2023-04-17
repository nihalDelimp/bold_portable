const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        status_seen: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
