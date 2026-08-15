const { Transaction } = require('../models/transaction.js');
const { Request } = require('../models/request.js');
const { Negotiation } = require('../models/negotiation.js');
const { Item } = require('../models/items.js');
const { AppError } = require('../utils/appError.js');

const createTransactionFromRequest = async (req, res) => {
    const { requestId } = req.params;

    const request = await Request.findById(requestId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }

    if (request.lender.toString() !== req.user.id) {
        throw new AppError('Only lender can create a transaction', 403);
    }

    if (request.status !== 'accepted') {
        throw new AppError('Request must be accepted before creating transaction', 400);
    }

    const existingTransaction = await Transaction.findOne({ request: requestId });
    if (existingTransaction) {
        throw new AppError('Transaction already exists for this request', 409);
    }

    const overlap = await Transaction.findOne({
        item: request.item,
        status: { $in: ['pending', 'active', 'overdue'] },
        startDate: { $lte: request.endDate },
        endDate: { $gte: request.startDate },
    });

    if (overlap) {
        throw new AppError('Item already has a conflicting active transaction', 409);
    }

    const item = await Item.findById(request.item);
    if (!item) {
        throw new AppError('Item not found', 404);
    }

    const negotiation = await Negotiation.findOne({ request: request._id, status: 'accepted' });

    const agreedRentalPrice =
        negotiation?.finalAgreedPrice ??
        request.offeredPrice ??
        item.rentalPrice;

    const transaction = new Transaction({
        request: request._id,
        item: request.item,
        borrower: request.borrower,
        lender: request.lender,
        agreedRentalPrice,
        startDate: request.startDate,
        endDate: request.endDate,
        dueDate: request.endDate,
        status: 'pending',
    });

    await transaction.save();

    item.status = 'unavailable';
    await item.save();

    res.status(201).json({ transaction });
};

const getMyLendingTransactions = async (req, res) => {
    const transactions = await Transaction.find({ lender: req.user.id })
        .populate('item', 'name category')
        .populate('borrower', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
};

const getMyBorrowingTransactions = async (req, res) => {
    const transactions = await Transaction.find({ borrower: req.user.id })
        .populate('item', 'name category')
        .populate('lender', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
};

const updateTransactionStatus = async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'overdue', 'completed', 'cancelled', 'disputed'].includes(status)) {
        throw new AppError('Invalid status update', 400);
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    const isLender = transaction.lender.toString() === req.user.id;
    const isBorrower = transaction.borrower.toString() === req.user.id;

    if (!isLender && !isBorrower) {
        throw new AppError('You are not authorized to update this transaction', 403);
    }

    if (status === 'cancelled' && !isLender) {
        throw new AppError('Only lender can cancel transaction', 403);
    }

    if ((status === 'overdue' || status === 'disputed') && !isLender) {
        throw new AppError('Only lender can mark overdue or disputed', 403);
    }

    transaction.status = status;

    if (status === 'completed') {
        transaction.returnDate = new Date();

        const item = await Item.findById(transaction.item);
        if (item) {
            item.status = 'available';
            await item.save();
        }
    }

    await transaction.save();

    res.status(200).json({ transaction });
};

module.exports = {
    createTransactionFromRequest,
    getMyLendingTransactions,
    getMyBorrowingTransactions,
    updateTransactionStatus,
};
