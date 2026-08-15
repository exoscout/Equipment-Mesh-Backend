const { Review } = require('../models/review.js');
const { User } = require('../models/user.js');
const { Transaction } = require('../models/transaction.js');
const { AppError } = require('../utils/appError.js');

const updateUserRating = async (userId) => {
    const stats = await Review.aggregate([
        { $match: { reviewee: userId } },
        {
            $group: {
                _id: '$reviewee',
                averageRating: { $avg: '$rating' },
            },
        },
    ]);

    const rating = stats.length > 0 ? Number(stats[0].averageRating.toFixed(2)) : null;
    await User.findByIdAndUpdate(userId, { rating });
};

const createReview = async (req, res) => {
    const { transactionId, rating, comment } = req.body;

    if (!transactionId || rating === undefined) {
        throw new AppError('transactionId and rating are required', 400);
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new AppError('Transaction not found', 404);
    }

    if (transaction.status !== 'completed') {
        throw new AppError('Reviews can only be submitted for completed transactions', 400);
    }

    const reviewerId = req.user.id;
    const isLender = transaction.lender.toString() === reviewerId;
    const isBorrower = transaction.borrower.toString() === reviewerId;

    if (!isLender && !isBorrower) {
        throw new AppError('You are not part of this transaction', 403);
    }

    if (Number(rating) <= 2 && (!comment || !comment.trim())) {
        throw new AppError('Comment is required for low rating', 400);
    }

    const reviewee = isLender ? transaction.borrower : transaction.lender;

    let review = await Review.findOne({ reviewer: reviewerId, transaction: transactionId });

    if (review) {
        review.rating = rating;
        review.comment = comment || '';
    } else {
        review = new Review({
            reviewer: reviewerId,
            reviewee,
            transaction: transactionId,
            rating,
            comment: comment || '',
        });
    }

    await review.save();
    await User.findByIdAndUpdate(reviewee, { $addToSet: { reviews: review._id } });
    await updateUserRating(reviewee);

    res.status(201).json({ review });
};

const editReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId).select('+transaction');
    if (!review) {
        throw new AppError('Review not found', 404);
    }

    if (review.reviewer.toString() !== req.user.id) {
        throw new AppError('You are not authorized to edit this review', 403);
    }

    if (rating !== undefined) {
        review.rating = rating;
    }

    if (comment !== undefined) {
        review.comment = comment;
    }

    if (Number(review.rating) <= 2 && (!review.comment || !review.comment.trim())) {
        throw new AppError('Comment is required for low rating', 400);
    }

    await review.save();
    await updateUserRating(review.reviewee);

    res.status(200).json({ review });
};

const getUserReviews = async (req, res) => {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
        .populate('reviewer', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
};

module.exports = {
    createReview,
    editReview,
    getUserReviews,
};
