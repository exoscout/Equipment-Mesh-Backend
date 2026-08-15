const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const {
    createTransactionFromRequest,
    getMyLendingTransactions,
    getMyBorrowingTransactions,
    updateTransactionStatus,
} = require('../controllers/transactionController.js');

const router = Router();

router.post('/from-request/:requestId', authenticate, createTransactionFromRequest);
router.post('/createFromRequest/:requestId', authenticate, createTransactionFromRequest);
router.get('/my-lending', authenticate, getMyLendingTransactions);
router.get('/myLending', authenticate, getMyLendingTransactions);
router.get('/my-borrowing', authenticate, getMyBorrowingTransactions);
router.get('/myBorrowing', authenticate, getMyBorrowingTransactions);
router.patch('/:transactionId/status', authenticate, updateTransactionStatus);

module.exports = router;
