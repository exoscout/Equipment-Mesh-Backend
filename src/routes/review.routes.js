const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const { createReview, editReview, getUserReviews } = require('../controllers/reviewController.js');

const router = Router();

router.post('/', authenticate, createReview);
router.post('/createReview', authenticate, createReview);
router.patch('/:reviewId', authenticate, editReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;
