const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'کاربر نظردهنده الزامی است']
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
        minlength: [10, 'نظر باید حداقل 10 کاراکتر باشد']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان کتاب الزامی است'],
        trim: true,
        maxlength: [100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد']
    },
    author: {
        type: String,
        required: [true, 'نام نویسنده الزامی است'],
        trim: true
    },
    isbn: {
        type: String,
        required: [true, 'شابک الزامی است'],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^(?:\d{10}|\d{13})$/.test(v);
            },
            message: 'شابک باید 10 یا 13 رقمی باشد'
        }
    },
    price: {
        type: Number,
        required: [true, 'قیمت کتاب الزامی است'],
        min: [0, 'قیمت نمی‌تواند منفی باشد']
    },
    publishYear: {
        type: Number,
        required: [true, 'سال انتشار الزامی است'],
        min: [1800, 'سال انتشار نامعتبر است'],
        max: [new Date().getFullYear(), 'سال انتشار نمی‌تواند از سال جاری بیشتر باشد']
    },
    description: {
        type: String,
        required: [true, 'توضیحات کتاب الزامی است'],
        minlength: [50, 'توضیحات باید حداقل 50 کاراکتر باشد'],
        maxlength: [2000, 'توضیحات نمی‌تواند بیشتر از 2000 کاراکتر باشد']
    },
    category: {
        type: String,
        required: [true, 'دسته‌بندی کتاب الزامی است'],
        enum: {
            values: ['رمان', 'علمی', 'تاریخی', 'فلسفی', 'کودک', 'آموزشی', 'سایر'],
            message: 'دسته‌بندی انتخاب شده معتبر نیست'
        }
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'موجودی نمی‌تواند منفی باشد']
    },
    coverImage: {
        type: String,
        default: 'default-book-cover.jpg'
    },
    reviews: [reviewSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'میانگین امتیاز نمی‌تواند منفی باشد'],
        max: [5, 'میانگین امتیاز نمی‌تواند بیشتر از 5 باشد'],
        set: val => Math.round(val * 10) / 10
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ایندکس‌ها برای بهبود عملکرد جستجو
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ isbn: 1 }, { unique: true });

// محاسبه میانگین امتیازات
bookSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.averageRating = 0;
        this.numberOfReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.averageRating = sum / this.reviews.length;
        this.numberOfReviews = this.reviews.length;
    }
};

// قبل از ذخیره، میانگین امتیازات را محاسبه کن
bookSchema.pre('save', function(next) {
    if (this.isModified('reviews')) {
        this.calculateAverageRating();
    }
    next();
});

module.exports = mongoose.model('Book', bookSchema);
