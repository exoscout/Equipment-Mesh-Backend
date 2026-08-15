const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const {
    getNegotiationByRequest,
    makeOffer,
    acceptOffer,
    closeNegotiation,
} = require('../controllers/negotiationController.js');

const router = Router();

router.get('/request/:requestId', authenticate, getNegotiationByRequest);
router.post('/request/:requestId/offer', authenticate, makeOffer);
router.post('/request/:requestId/makeOffer', authenticate, makeOffer);
router.patch('/:negotiationId/accept', authenticate, acceptOffer);
router.patch('/:negotiationId/close', authenticate, closeNegotiation);

module.exports = router;
