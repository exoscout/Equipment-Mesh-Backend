const { Report } = require('../models/report.js');
const { Dispute } = require('../models/dispute.js');
const { Transaction } = require('../models/transaction.js');
const { AppError } = require('../utils/appError.js');

const createReport = async (req, res) => {
    const { reportedUser, reason, description, transactionId } = req.body;

    if (!reportedUser || !reason) {
        throw new AppError('reportedUser and reason are required', 400);
    }

    const report = new Report({
        reporter: req.user.id,
        reportedUser,
        reason,
        description: description || '',
        transaction: transactionId || null,
    });

    await report.save();

    res.status(201).json({ report });
};

const createDispute = async (req, res) => {
    const { transactionId, reason, details } = req.body;

    if (!transactionId || !reason) {
        throw new AppError('transactionId and reason are required', 400);
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    const userId = req.user.id;
    const isLender = transaction.lender.toString() === userId;
    const isBorrower = transaction.borrower.toString() === userId;

    if (!isLender && !isBorrower) {
        throw new AppError('You are not part of this transaction', 403);
    }

    const againstUser = isLender ? transaction.borrower : transaction.lender;

    const dispute = new Dispute({
        transaction: transaction._id,
        openedBy: userId,
        againstUser,
        reason,
        details: details || '',
    });

    transaction.status = 'disputed';
    await Promise.all([dispute.save(), transaction.save()]);

    res.status(201).json({ dispute });
};

const getMyReports = async (req, res) => {
    const reports = await Report.find({ reporter: req.user.id })
        .populate('reportedUser', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ reports });
};

const getMyDisputes = async (req, res) => {
    const disputes = await Dispute.find({
        $or: [{ openedBy: req.user.id }, { againstUser: req.user.id }],
    })
        .populate('openedBy', 'name email')
        .populate('againstUser', 'name email')
        .populate('transaction', 'status startDate endDate')
        .sort({ createdAt: -1 });

    res.status(200).json({ disputes });
};

module.exports = {
    createReport,
    createDispute,
    getMyReports,
    getMyDisputes,
};
