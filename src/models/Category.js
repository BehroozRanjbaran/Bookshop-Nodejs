const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'نام دسته‌بندی الزامی است'],
        unique: true,
        trim: true,
        maxlength: [50, 'نام دسته‌بندی نمی‌تواند بیشتر از 50 کاراکتر باشد']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'توضیحات دسته‌بندی الزامی است'],
        trim: true,
        maxlength: [250, 'توضیحات دسته‌بندی نمی‌تواند بیشتر از 250 کاراکتر باشد']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    icon: {
        type: String,
        default: 'default-category-icon.png'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    bookCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ایجاد slug قبل از ذخیره
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'fa'
        });
    }
    next();
});

// ایندکس‌ها برای بهبود عملکرد
categorySchema.index({ name: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

// متد استاتیک برای دریافت سلسله مراتب دسته‌بندی‌ها
categorySchema.statics.getHierarchy = async function() {
    return this.find({ parent: null })
        .populate({
            path: 'children',
            populate: { path: 'children' }
        })
        .sort('order');
};

// متد برای به‌روزرسانی تعداد کتاب‌ها
categorySchema.methods.updateBookCount = async function() {
    this.bookCount = await mongoose.model('Book').countDocuments({ category: this._id });
    await this.save();
};

// مجازی‌سازی برای دریافت مسیر کامل دسته‌بندی
categorySchema.virtual('fullPath').get(async function() {
    let path = [this.name];
    let currentCategory = this;
    
    while (currentCategory.parent) {
        currentCategory = await mongoose.model('Category').findById(currentCategory.parent);
        if (currentCategory) {
            path.unshift(currentCategory.name);
        }
    }
    
    return path.join(' > ');
});

// میدلور برای حذف دسته‌بندی
categorySchema.pre('remove', async function(next) {
    // انتقال کتاب‌ها به دسته‌بندی پیش‌فرض
    await mongoose.model('Book').updateMany(
        { category: this._id },
        { category: process.env.DEFAULT_CATEGORY_ID }
    );
    
    // به‌روزرسانی دسته‌بندی والد
    if (this.parent) {
        await mongoose.model('Category').findByIdAndUpdate(
            this.parent,
            { $pull: { children: this._id } }
        );
    }
    
    next();
});

module.exports = mongoose.model('Category', categorySchema);
