const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    entityType: {
        type: String,
        default: '',
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = {
    Notification: mongoose.model('Notification', notificationSchema),
};
