const { ConditionCard } = require('../models/conditionCard.js');
const { Transaction } = require('../models/transaction.js');
const { Item } = require('../models/items.js');
const { AppError } = require('../utils/appError.js');

const createOrUpdateLenderDraft = async (req, res) => {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    if (transaction.lender.toString() !== req.user.id) {
        throw new AppError('Only lender can create or update condition draft', 403);
    }

    let conditionCard = await ConditionCard.findOne({ transaction: transactionId });

    if (!conditionCard) {
        conditionCard = new ConditionCard({
            transaction: transaction._id,
            item: transaction.item,
            lender: transaction.lender,
            borrower: transaction.borrower,
        });
    }

    if (conditionCard.preBorrowStatus === 'confirmed') {
        throw new AppError('Condition card already confirmed', 400);
    }

    conditionCard.lenderDraft = {
        ...conditionCard.lenderDraft,
        ...req.body,
    };

    conditionCard.preBorrowStatus = 'review';
    conditionCard.lenderConfirmed = false;
    conditionCard.borrowerConfirmed = false;

    await conditionCard.save();

    res.status(200).json({ conditionCard });
};

const submitBorrowerSuggestions = async (req, res) => {
    const { transactionId } = req.params;
    const conditionCard = await ConditionCard.findOne({ transaction: transactionId });

    if (!conditionCard) {
        throw new AppError('Condition card not found', 404);
    }

    if (conditionCard.borrower.toString() !== req.user.id) {
        throw new AppError('Only borrower can submit suggestions', 403);
    }

    if (conditionCard.preBorrowStatus === 'confirmed') {
        throw new AppError('Condition card already confirmed', 400);
    }

    conditionCard.borrowerSuggestions = {
        ...conditionCard.borrowerSuggestions,
        ...req.body,
    };

    conditionCard.agreedSnapshot = {
        ...conditionCard.lenderDraft,
        ...conditionCard.borrowerSuggestions,
    };

    conditionCard.preBorrowStatus = 'agreed';
    conditionCard.lenderConfirmed = false;
    conditionCard.borrowerConfirmed = false;

    await conditionCard.save();

    res.status(200).json({ conditionCard });
};

const confirmPreBorrowCondition = async (req, res) => {
    const { transactionId } = req.params;
    const conditionCard = await ConditionCard.findOne({ transaction: transactionId });

    if (!conditionCard) {
        throw new AppError('Condition card not found', 404);
    }

    const userId = req.user.id;

    if (conditionCard.lender.toString() === userId) {
        conditionCard.lenderConfirmed = true;
    } else if (conditionCard.borrower.toString() === userId) {
        conditionCard.borrowerConfirmed = true;
    } else {
        throw new AppError('You are not part of this transaction', 403);
    }

    if (conditionCard.lenderConfirmed && conditionCard.borrowerConfirmed) {
        conditionCard.preBorrowStatus = 'confirmed';
    }

    await conditionCard.save();

    res.status(200).json({ conditionCard });
};

const submitReturnAssessment = async (req, res) => {
    const { transactionId } = req.params;
    const conditionCard = await ConditionCard.findOne({ transaction: transactionId });

    if (!conditionCard) {
        throw new AppError('Condition card not found', 404);
    }

    const userId = req.user.id;
    const payload = {
        ...req.body,
        submittedAt: new Date(),
    };

    if (conditionCard.lender.toString() === userId) {
        conditionCard.returnAssessment.lender = payload;
    } else if (conditionCard.borrower.toString() === userId) {
        conditionCard.returnAssessment.borrower = payload;
    } else {
        throw new AppError('You are not part of this transaction', 403);
    }

    const lenderAssessment = conditionCard.returnAssessment.lender;
    const borrowerAssessment = conditionCard.returnAssessment.borrower;

    if (lenderAssessment?.submittedAt && borrowerAssessment?.submittedAt) {
        const disagreement =
            lenderAssessment.conditionRating !== borrowerAssessment.conditionRating ||
            lenderAssessment.damageReported !== borrowerAssessment.damageReported;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new AppError('Transaction not found', 404);
        }

        if (disagreement) {
            conditionCard.disputeOpened = true;
            transaction.status = 'disputed';
        } else {
            transaction.status = 'completed';
            transaction.returnDate = new Date();

            const item = await Item.findById(transaction.item);
            if (item) {
                item.status = 'available';
                await item.save();
            }
        }

        await transaction.save();
    }

    await conditionCard.save();

    res.status(200).json({ conditionCard });
};

const getConditionCard = async (req, res) => {
    const { transactionId } = req.params;
    const conditionCard = await ConditionCard.findOne({ transaction: transactionId });

    if (!conditionCard) {
        throw new AppError('Condition card not found', 404);
    }

    const userId = req.user.id;
    const isParty =
        conditionCard.lender.toString() === userId ||
        conditionCard.borrower.toString() === userId;

    if (!isParty) {
        throw new AppError('You are not authorized to view this condition card', 403);
    }

    res.status(200).json({ conditionCard });
};

module.exports = {
    createOrUpdateLenderDraft,
    submitBorrowerSuggestions,
    confirmPreBorrowCondition,
    submitReturnAssessment,
    getConditionCard,
};
