const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
    agreedRentalPrice: {
        type: Number,
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
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'overdue', 'completed', 'cancelled', 'disputed'],
        default: 'pending',
    },
    returnDate: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

transactionSchema.path('endDate').validate(function (value) {
    return this.startDate <= value;
}, 'endDate must be greater than or equal to startDate');

module.exports = {
    Transaction: mongoose.model('Transaction', transactionSchema),
};
