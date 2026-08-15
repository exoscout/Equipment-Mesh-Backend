const { Notification } = require('../models/notification.js');
const { AppError } = require('../utils/appError.js');

const createNotification = async (req, res) => {
    const { recipient, type, message, entityType, entityId } = req.body;

    if (!recipient || !type || !message) {
        throw new AppError('recipient, type and message are required', 400);
    }

    const notification = new Notification({
        recipient,
        type,
        message,
        entityType: entityType || '',
        entityId: entityId || null,
    });

    await notification.save();
    res.status(201).json({ notification });
};

const getMyNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
};

const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    if (notification.recipient.toString() !== req.user.id) {
        throw new AppError('You are not authorized to update this notification', 403);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ notification });
};

module.exports = {
    createNotification,
    getMyNotifications,
    markNotificationAsRead,
};
