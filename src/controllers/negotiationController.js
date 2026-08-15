const { Negotiation } = require('../models/negotiation.js');
const { Request } = require('../models/request.js');
const { AppError } = require('../utils/appError.js');

const validateParticipant = (request, userId) => {
    const isBorrower = request.borrower.toString() === userId;
    const isLender = request.lender.toString() === userId;

    if (!isBorrower && !isLender) {
        throw new AppError('You are not part of this request', 403);
    }
};

const getNegotiationByRequest = async (req, res) => {
    const { requestId } = req.params;

    const negotiation = await Negotiation.findOne({ request: requestId })
        .populate('borrower', 'name email')
        .populate('lender', 'name email')
        .populate('item', 'name category rentalPrice');

    if (!negotiation) {
        throw new AppError('Negotiation not found for this request', 404);
    }

    const isBorrower = negotiation.borrower._id.toString() === req.user.id;
    const isLender = negotiation.lender._id.toString() === req.user.id;

    if (!isBorrower && !isLender) {
        throw new AppError('You are not authorized to view this negotiation', 403);
    }

    res.status(200).json({ negotiation });
};

const makeOffer = async (req, res) => {
    const { requestId } = req.params;
    const { amount, message } = req.body;

    if (amount === undefined || Number(amount) < 0) {
        throw new AppError('Valid offer amount is required', 400);
    }

    const request = await Request.findById(requestId);
    if (!request) {
        throw new AppError('Request not found', 404);
    }

    validateParticipant(request, req.user.id);

    if (request.status !== 'pending') {
        throw new AppError('Negotiation is allowed only for pending requests', 400);
    }

    let negotiation = await Negotiation.findOne({ request: requestId });

    if (!negotiation) {
        negotiation = new Negotiation({
            request: request._id,
            item: request.item,
            borrower: request.borrower,
            lender: request.lender,
            offers: [],
            status: 'open',
        });
    }

    if (negotiation.status !== 'open') {
        throw new AppError('Negotiation is already closed', 400);
    }

    negotiation.offers.push({
        byUser: req.user.id,
        amount: Number(amount),
        message: message || '',
    });

    await negotiation.save();

    res.status(200).json({ negotiation });
};

const acceptOffer = async (req, res) => {
    const { negotiationId } = req.params;
    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
        throw new AppError('Negotiation not found', 404);
    }

    const isBorrower = negotiation.borrower.toString() === req.user.id;
    const isLender = negotiation.lender.toString() === req.user.id;

    if (!isBorrower && !isLender) {
        throw new AppError('You are not authorized to accept this offer', 403);
    }

    if (negotiation.status !== 'open') {
        throw new AppError('Negotiation is not open', 400);
    }

    if (negotiation.offers.length === 0) {
        throw new AppError('No offer exists to accept', 400);
    }

    const latestOffer = negotiation.offers[negotiation.offers.length - 1];

    negotiation.status = 'accepted';
    negotiation.finalAgreedPrice = latestOffer.amount;
    negotiation.acceptedBy = req.user.id;
    negotiation.acceptedAt = new Date();

    await negotiation.save();
    await Request.findByIdAndUpdate(negotiation.request, { status: 'accepted' });

    res.status(200).json({
        message: 'Offer accepted successfully',
        negotiation,
    });
};

const closeNegotiation = async (req, res) => {
    const { negotiationId } = req.params;
    const { status } = req.body;

    if (!status || !['rejected', 'closed'].includes(status)) {
        throw new AppError('Status must be rejected or closed', 400);
    }

    const negotiation = await Negotiation.findById(negotiationId);

    if (!negotiation) {
        throw new AppError('Negotiation not found', 404);
    }

    const isBorrower = negotiation.borrower.toString() === req.user.id;
    const isLender = negotiation.lender.toString() === req.user.id;

    if (!isBorrower && !isLender) {
        throw new AppError('You are not authorized to close this negotiation', 403);
    }

    if (negotiation.status !== 'open') {
        throw new AppError('Negotiation is already closed', 400);
    }

    negotiation.status = status;
    await negotiation.save();

    if (status === 'rejected') {
        await Request.findByIdAndUpdate(negotiation.request, { status: 'rejected' });
    }

    res.status(200).json({
        message: 'Negotiation updated successfully',
        negotiation,
    });
};

module.exports = {
    getNegotiationByRequest,
    makeOffer,
    acceptOffer,
    closeNegotiation,
};
