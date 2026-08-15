const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const { createNotification, getMyNotifications, markNotificationAsRead } = require('../controllers/notificationController.js');

const router = Router();

router.post('/', authenticate, createNotification);
router.get('/my', authenticate, getMyNotifications);
router.patch('/:notificationId/read', authenticate, markNotificationAsRead);

module.exports = router;
