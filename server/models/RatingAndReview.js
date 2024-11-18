const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },


});

// export model user with RatingAndReviewSchema

module.exports = mongoose.model('RatingAndReview', ratingAndReviewSchema);