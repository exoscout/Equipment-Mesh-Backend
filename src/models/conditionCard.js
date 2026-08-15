const mongoose = require('mongoose');

const sideAssessmentSchema = new mongoose.Schema({
    conditionRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    damageReported: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        default: '',
    },
    photos: [{ type: String }],
    submittedAt: {
        type: Date,
        default: null,
    },
}, { _id: false });

const conditionCardSchema = new mongoose.Schema({
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        unique: true,
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    lender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lenderDraft: {
        condition: { type: String, default: '' },
        existingDamage: { type: String, default: '' },
        accessories: [{ type: String }],
        notes: { type: String, default: '' },
        photos: [{ type: String }],
        expectedReturnCondition: { type: String, default: '' },
    },
    borrowerSuggestions: {
        condition: { type: String, default: '' },
        existingDamage: { type: String, default: '' },
        accessories: [{ type: String }],
        notes: { type: String, default: '' },
        photos: [{ type: String }],
        expectedReturnCondition: { type: String, default: '' },
    },
    agreedSnapshot: {
        condition: { type: String, default: '' },
        existingDamage: { type: String, default: '' },
        accessories: [{ type: String }],
        notes: { type: String, default: '' },
        photos: [{ type: String }],
        expectedReturnCondition: { type: String, default: '' },
    },
    preBorrowStatus: {
        type: String,
        enum: ['draft', 'review', 'agreed', 'confirmed'],
        default: 'draft',
    },
    lenderConfirmed: {
        type: Boolean,
        default: false,
    },
    borrowerConfirmed: {
        type: Boolean,
        default: false,
    },
    returnAssessment: {
        lender: sideAssessmentSchema,
        borrower: sideAssessmentSchema,
    },
    disputeOpened: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = {
    ConditionCard: mongoose.model('ConditionCard', conditionCardSchema),
};
