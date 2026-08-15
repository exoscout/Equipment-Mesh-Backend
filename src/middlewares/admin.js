const { AppError } = require('../utils/appError.js');

const requireAdmin = (req, res, next) => {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

    const userEmail = (req.user?.email || '').toLowerCase();

    if (!adminEmails.includes(userEmail)) {
        throw new AppError('Admin access required', 403);
    }

    next();
};

module.exports = {
    requireAdmin,
};
