const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// اعتبارسنجی‌های مورد نیاز برای ثبت‌نام
const registerValidation = [
    check('name', 'نام الزامی است').not().isEmpty(),
    check('email', 'لطفاً یک ایمیل معتبر وارد کنید').isEmail(),
    check('password', 'رمز عبور باید حداقل 6 کاراکتر باشد').isLength({ min: 6 })
];

// ثبت‌نام کاربر جدید
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // بررسی وجود کاربر
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'این ایمیل قبلاً ثبت شده است' });
        }

        // ایجاد کاربر جدید
        user = new User({
            name,
            email,
            password
        });

        // رمزنگاری پسورد
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // ایجاد توکن
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// ورود کاربر
router.post('/login', [
    check('email', 'لطفاً یک ایمیل معتبر وارد کنید').isEmail(),
    check('password', 'رمز عبور الزامی است').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // بررسی وجود کاربر
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'اطلاعات ورود نامعتبر است' });
        }

        // بررسی پسورد
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'اطلاعات ورود نامعتبر است' });
        }

        // ایجاد توکن
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// دریافت اطلاعات کاربر
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

// به‌روزرسانی اطلاعات کاربر
router.put('/update', auth, async (req, res) => {
    try {
        const { name, email } = req.body;
        const userFields = {};
        if (name) userFields.name = name;
        if (email) userFields.email = email;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'کاربر یافت نشد' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('خطای سرور');
    }
});

module.exports = router;
