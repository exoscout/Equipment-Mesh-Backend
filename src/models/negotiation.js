const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const negotiationSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
        unique: true,
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    offers: [offerSchema],
    status: {
        type: String,
        enum: ['open', 'accepted', 'rejected', 'closed'],
        default: 'open',
    },
    finalAgreedPrice: {
        type: Number,
        default: null,
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    acceptedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = {
    Negotiation: mongoose.model('Negotiation', negotiationSchema),
};
