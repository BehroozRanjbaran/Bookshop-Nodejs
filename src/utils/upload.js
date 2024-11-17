// src/utils/upload.js
const multer = require('multer');
const path = require('path');

// تنظیمات ذخیره‌سازی
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/books'); // مسیر ذخیره فایل‌ها
    },
    filename: function (req, file, cb) {
        cb(null, `book-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// فیلتر کردن فایل‌های مجاز
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('فقط فایل‌های تصویری مجاز هستند!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // حداکثر 5 مگابایت
    }
});

module.exports = upload;
