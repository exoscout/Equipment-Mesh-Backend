const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const {
    createOrUpdateLenderDraft,
    submitBorrowerSuggestions,
    confirmPreBorrowCondition,
    submitReturnAssessment,
    getConditionCard,
} = require('../controllers/conditionCardController.js');

const router = Router();

router.get('/:transactionId', authenticate, getConditionCard);
router.post('/:transactionId/lender-draft', authenticate, createOrUpdateLenderDraft);
router.post('/:transactionId/borrower-suggestions', authenticate, submitBorrowerSuggestions);
router.post('/:transactionId/confirm', authenticate, confirmPreBorrowCondition);
router.post('/:transactionId/return-assessment', authenticate, submitReturnAssessment);

module.exports = router;
