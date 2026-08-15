const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const { requireAdmin } = require('../middlewares/admin.js');
const {
    getOverdueTransactions,
    listReports,
    listDisputes,
    updateReportStatus,
    updateDisputeStatus,
    moderateUser,
} = require('../controllers/adminController.js');

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/overdue-transactions', getOverdueTransactions);
router.get('/reports', listReports);
router.get('/disputes', listDisputes);
router.patch('/reports/:reportId/status', updateReportStatus);
router.patch('/disputes/:disputeId/status', updateDisputeStatus);
router.patch('/users/:userId/moderate', moderateUser);

module.exports = router;
