const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
    },
    openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    againstUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    details: {
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
    Dispute: mongoose.model('Dispute', disputeSchema),
};
