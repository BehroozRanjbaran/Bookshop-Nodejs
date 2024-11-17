const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');

// ایجاد نظر جدید
router.post('/:bookId', [
    auth,
    [
        check('rating', 'امتیاز باید بین 1 تا 5 باشد').isInt({ min: 1, max: 5 }),
        check('comment', 'متن نظر الزامی است').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ msg: 'کتاب مورد نظر یافت نشد' });
        }

        // بررسی نظر تکراری
        const existingReview = await Review.findOne({
            book: req.params.bookId,
            user: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({ msg: 'شما قبلاً برای این کتاب نظر ثبت کرده‌اید' });
        }

        const newReview = new Review({
            book: req.params.bookId,
            user: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        const review = await newReview.save();
        await review.populate('user', 'name');
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// دریافت تمام نظرات یک کتاب
router.get('/book/:bookId', async (req, res) => {
    try {
        const reviews = await Review.find({ book: req.params.bookId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// ویرایش نظر
router.put('/:id', [
    auth,
    [
        check('rating', 'امتیاز باید بین 1 تا 5 باشد').isInt({ min: 1, max: 5 }),
        check('comment', 'متن نظر الزامی است').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ msg: 'نظر مورد نظر یافت نشد' });
        }

        // بررسی مالکیت نظر
        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'دسترسی غیرمجاز' });
        }

        review.rating = req.body.rating;
        review.comment = req.body.comment;
        review = await review.save();
        await review.populate('user', 'name');
        
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// حذف نظر
router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ msg: 'نظر مورد نظر یافت نشد' });
        }

        // بررسی مالکیت نظر
        if (review.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'دسترسی غیرمجاز' });
        }

        await review.remove();
        res.json({ msg: 'نظر با موفقیت حذف شد' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// لایک/آنلایک نظر
router.put('/like/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ msg: 'نظر مورد نظر یافت نشد' });
        }

        // بررسی لایک قبلی
        const likeIndex = review.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            // حذف لایک
            review.likes.splice(likeIndex, 1);
        } else {
            // افزودن لایک
            review.likes.push(req.user.id);
        }

        await review.save();
        res.json(review.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

module.exports = router;
