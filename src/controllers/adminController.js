const { Transaction } = require('../models/transaction.js');
const { Report } = require('../models/report.js');
const { Dispute } = require('../models/dispute.js');
const { User } = require('../models/user.js');
const { AppError } = require('../utils/appError.js');

const getOverdueTransactions = async (req, res) => {
    const overdueTransactions = await Transaction.find({ status: 'overdue' })
        .populate('item', 'name')
        .populate('lender', 'name email')
        .populate('borrower', 'name email')
        .sort({ updatedAt: -1 });

    res.status(200).json({ overdueTransactions });
};

const listReports = async (req, res) => {
    const reports = await Report.find({})
        .populate('reporter', 'name email')
        .populate('reportedUser', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ reports });
};

const listDisputes = async (req, res) => {
    const disputes = await Dispute.find({})
        .populate('openedBy', 'name email')
        .populate('againstUser', 'name email')
        .populate('transaction', 'status startDate endDate')
        .sort({ createdAt: -1 });

    res.status(200).json({ disputes });
};

const updateReportStatus = async (req, res) => {
    const { reportId } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status || !['open', 'in_review', 'resolved'].includes(status)) {
        throw new AppError('Invalid report status', 400);
    }

    const report = await Report.findById(reportId);
    if (!report) {
        throw new AppError('Report not found', 404);
    }

    report.status = status;
    if (resolutionNotes !== undefined) {
        report.resolutionNotes = resolutionNotes;
    }

    await report.save();

    res.status(200).json({ report });
};

const updateDisputeStatus = async (req, res) => {
    const { disputeId } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status || !['open', 'in_review', 'resolved'].includes(status)) {
        throw new AppError('Invalid dispute status', 400);
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
        throw new AppError('Dispute not found', 404);
    }

    dispute.status = status;
    if (resolutionNotes !== undefined) {
        dispute.resolutionNotes = resolutionNotes;
    }

    await dispute.save();

    if (status === 'resolved') {
        const transaction = await Transaction.findById(dispute.transaction);
        if (transaction && transaction.status === 'disputed') {
            transaction.status = 'completed';
            transaction.returnDate = transaction.returnDate || new Date();
            await transaction.save();
        }
    }

    res.status(200).json({ dispute });
};

const moderateUser = async (req, res) => {
    const { userId } = req.params;
    const { status, banExpires } = req.body;

    if (!status || !['active', 'restricted', 'banned'].includes(status)) {
        throw new AppError('Invalid user status', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.status.state = status;

    if (status === 'banned' && banExpires) {
        user.status.banExpires = new Date(banExpires);
    }

    if (status !== 'banned') {
        user.status.banExpires = null;
    }

    await user.save();

    res.status(200).json({ user });
};

module.exports = {
    getOverdueTransactions,
    listReports,
    listDisputes,
    updateReportStatus,
    updateDisputeStatus,
    moderateUser,
};
