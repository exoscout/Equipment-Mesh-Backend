const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null,
    },
    reason: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['open', 'in_review', 'resolved'],
        default: 'open',
    },
    resolutionNotes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = {
    Report: mongoose.model('Report', reportSchema),
};
