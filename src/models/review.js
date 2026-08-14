const reviewSchema = new mongoose.Schema({
    reviewer : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee : {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transaction : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        select: false
    },
    rating : {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment : {
        type: String,
    },
})

module.exports = {
    Review : mongoose.model('Review', reviewSchema)
}