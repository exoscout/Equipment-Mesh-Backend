const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const {
    createRequest,
    getMyBorrowRequests,
    getIncomingRequests,
    updateRequestStatus,
} = require('../controllers/requestController.js');

const router = Router();

router.post('/', authenticate, createRequest);
router.post('/createRequest', authenticate, createRequest);
router.get('/my-requests', authenticate, getMyBorrowRequests);
router.get('/myRequests', authenticate, getMyBorrowRequests);
router.get('/incoming', authenticate, getIncomingRequests);
router.patch('/:requestId/status', authenticate, updateRequestStatus);

module.exports = router;
