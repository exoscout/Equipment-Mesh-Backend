const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const { createReport, createDispute, getMyReports, getMyDisputes } = require('../controllers/reportDisputeController.js');

const router = Router();

router.post('/report', authenticate, createReport);
router.post('/dispute', authenticate, createDispute);
router.get('/my-reports', authenticate, getMyReports);
router.get('/my-disputes', authenticate, getMyDisputes);

module.exports = router;
