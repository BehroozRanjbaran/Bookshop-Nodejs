const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'کتاب مورد نظر برای ثبت نظر الزامی است']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'کاربر برای ثبت نظر الزامی است']
    },
    rating: {
        type: Number,
        required: [true, 'امتیاز الزامی است'],
        min: [1, 'حداقل امتیاز 1 است'],
        max: [5, 'حداکثر امتیاز 5 است']
    },
    comment: {
        type: String,
        required: [true, 'متن نظر الزامی است'],
        trim: true,
        minlength: [10, 'نظر باید حداقل 10 کاراکتر باشد'],
        maxlength: [1000, 'نظر نمی‌تواند بیشتر از 1000 کاراکتر باشد']
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// هر کاربر فقط می‌تواند یک نظر برای هر کتاب ثبت کند
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// محاسبه میانگین امتیازات برای کتاب
reviewSchema.statics.calculateAverageRating = async function(bookId) {
    const stats = await this.aggregate([
        {
            $match: { book: bookId }
        },
        {
            $group: {
                _id: '$book',
                averageRating: { $avg: '$rating' },
                numberOfReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Book').findByIdAndUpdate(bookId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            numberOfReviews: stats[0].numberOfReviews
        });
    } else {
        await mongoose.model('Book').findByIdAndUpdate(bookId, {
            averageRating: 0,
            numberOfReviews: 0
        });
    }
};

// بعد از ذخیره نظر جدید
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.book);
});

// قبل از حذف نظر
reviewSchema.pre('remove', function() {
    this.constructor.calculateAverageRating(this.book);
});

// افزودن فیلدهای مجازی
reviewSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

module.exports = mongoose.model('Review', reviewSchema);
