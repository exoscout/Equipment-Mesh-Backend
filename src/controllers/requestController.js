const { Request } = require('../models/request.js');
const { Item } = require('../models/items.js');
const { Transaction } = require('../models/transaction.js');
const { AppError } = require('../utils/appError.js');

const createRequest = async (req, res) => {
    const { itemId, startDate, endDate, offeredPrice, message } = req.body;

    if (!itemId || !startDate || !endDate) {
        throw new AppError('itemId, startDate, and endDate are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new AppError('Invalid date format', 400);
    }

    if (start > end) {
        throw new AppError('startDate must be less than or equal to endDate', 400);
    }

    const item = await Item.findById(itemId);
    if (!item) {
        throw new AppError('Item not found', 404);
    }

    if (item.status !== 'available') {
        throw new AppError('Item is currently unavailable', 400);
    }

    if (item.lister.toString() === req.user.id) {
        throw new AppError('You cannot request your own item', 400);
    }

    const hasOverdueBorrowing = await Transaction.exists({
        borrower: req.user.id,
        status: 'overdue',
    });

    if (hasOverdueBorrowing) {
        throw new AppError('You cannot create new requests while you have overdue transactions', 403);
    }

    const overlap = await Request.findOne({
        item: itemId,
        status: { $in: ['pending', 'accepted'] },
        startDate: { $lte: end },
        endDate: { $gte: start },
    });

    if (overlap) {
        throw new AppError('Requested date range conflicts with an existing request', 409);
    }

    const request = new Request({
        borrower: req.user.id,
        lender: item.lister,
        item: itemId,
        startDate: start,
        endDate: end,
        offeredPrice: offeredPrice !== undefined ? offeredPrice : null,
        message: message || '',
    });

    await request.save();

    res.status(201).json({ request });
};

const getMyBorrowRequests = async (req, res) => {
    const requests = await Request.find({ borrower: req.user.id })
        .populate('item', 'name category rentalPrice status')
        .populate('lender', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ requests });
};

const getIncomingRequests = async (req, res) => {
    const requests = await Request.find({ lender: req.user.id })
        .populate('item', 'name category rentalPrice status')
        .populate('borrower', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ requests });
};

const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status || !['accepted', 'rejected', 'cancelled'].includes(status)) {
        throw new AppError('Valid status is required: accepted, rejected, or cancelled', 400);
    }

    const request = await Request.findById(requestId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }

    if (request.status !== 'pending') {
        throw new AppError('Only pending requests can be updated', 400);
    }

    if (status === 'cancelled') {
        if (request.borrower.toString() !== req.user.id) {
            throw new AppError('Only borrower can cancel the request', 403);
        }
    } else if (request.lender.toString() !== req.user.id) {
        throw new AppError('Only lender can accept or reject the request', 403);
    }

    request.status = status;
    await request.save();

    res.status(200).json({ request });
};

module.exports = {
    createRequest,
    getMyBorrowRequests,
    getIncomingRequests,
    updateRequestStatus,
};
