const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
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
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    offeredPrice: {
        type: Number,
        default: null,
    },
    message: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

requestSchema.path('endDate').validate(function (value) {
    return this.startDate <= value;
}, 'endDate must be greater than or equal to startDate');

module.exports = {
    Request: mongoose.model('Request', requestSchema),
};
