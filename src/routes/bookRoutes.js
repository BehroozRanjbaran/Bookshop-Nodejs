const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const upload = require('../utils/upload'); // تغییر مسیر به utils
const catchAsync = require('../utils/catchAsync'); // اضافه کردن میدلور مدیریت خطا

// اعتبارسنجی‌های کتاب
const bookValidation = [
    check('title').notEmpty().withMessage('عنوان کتاب الزامی است')
        .trim().isLength({ min: 2 }).withMessage('عنوان کتاب باید حداقل 2 کاراکتر باشد'),
    check('author').notEmpty().withMessage('نام نویسنده الزامی است')
        .trim().isLength({ min: 2 }).withMessage('نام نویسنده باید حداقل 2 کاراکتر باشد'),
    check('isbn').matches(/^(?:\d{10}|\d{13})$/).withMessage('شابک باید 10 یا 13 رقمی باشد'),
    check('price').isFloat({ min: 0 }).withMessage('قیمت باید عددی مثبت باشد'),
    check('description').notEmpty().withMessage('توضیحات کتاب الزامی است')
        .trim().isLength({ min: 10 }).withMessage('توضیحات کتاب باید حداقل 10 کاراکتر باشد'),
    check('category').notEmpty().withMessage('دسته‌بندی کتاب الزامی است')
];

// دریافت همه کتاب‌ها با قابلیت فیلتر و مرتب‌سازی
router.get('/', catchAsync(async (req, res) => {
    const {
        category,
        author,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    // ساخت فیلتر
    const filter = {};
    if (category) filter.category = category;
    if (author) filter.author = new RegExp(author, 'i');
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // تنظیمات مرتب‌سازی
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
        Book.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .populate('category', 'name'),
        Book.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: {
            books,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalBooks: total,
                hasNextPage: skip + books.length < total,
                hasPrevPage: page > 1
            }
        }
    });
}));

// دریافت یک کتاب با شناسه
router.get('/:id', catchAsync(async (req, res) => {
    const book = await Book.findById(req.params.id)
        .populate('category', 'name')
        .populate({
            path: 'reviews',
            populate: { 
                path: 'user',
                select: 'name avatar'
            }
        });

    if (!book) {
        return res.status(404).json({
            status: 'error',
            message: 'کتاب مورد نظر یافت نشد'
        });
    }

    res.json({
        status: 'success',
        data: { book }
    });
}));

// افزودن کتاب جدید (فقط ادمین)
router.post('/',
    [auth, admin, upload.single('coverImage'), bookValidation],
    catchAsync(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const existingBook = await Book.findOne({ isbn: req.body.isbn });
        if (existingBook) {
            return res.status(400).json({
                status: 'error',
                message: 'کتابی با این شابک قبلاً ثبت شده است'
            });
        }

        const newBook = new Book({
            ...req.body,
            coverImage: req.file ? req.file.filename : 'default-book-cover.jpg',
            createdBy: req.user.id
        });

        await newBook.save();

        res.status(201).json({
            status: 'success',
            data: { book: newBook }
        });
    })
);

// به‌روزرسانی کتاب (فقط ادمین)
router.put('/:id',
    [auth, admin, upload.single('coverImage'), bookValidation],
    catchAsync(async (req, res) => {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: 'کتاب مورد نظر یافت نشد'
            });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.coverImage = req.file.filename;
            // حذف تصویر قبلی در صورت نیاز
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category', 'name');

        res.json({
            status: 'success',
            data: { book: updatedBook }
        });
    })
);

// حذف کتاب (فقط ادمین)
router.delete('/:id',
    [auth, admin],
    catchAsync(async (req, res) => {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: 'کتاب مورد نظر یافت نشد'
            });
        }

        await book.deleteOne();
        // حذف تصویر کتاب از سرور در صورت نیاز

        res.json({
            status: 'success',
            message: 'کتاب با موفقیت حذف شد'
        });
    })
);

// جستجوی کتاب
router.get('/search/:query', catchAsync(async (req, res) => {
    const searchQuery = req.params.query;
    const books = await Book.find({
        $or: [
            { title: new RegExp(searchQuery, 'i') },
            { author: new RegExp(searchQuery, 'i') },
            { isbn: new RegExp(searchQuery, 'i') }
        ]
    }).populate('category', 'name');

    res.json({
        status: 'success',
        results: books.length,
        data: { books }
    });
}));

module.exports = router;
