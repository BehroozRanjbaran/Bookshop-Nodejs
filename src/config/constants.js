// تنظیمات پایه
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookshop';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// تنظیمات آپلود
const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png'],
    DEFAULT_AVATAR: 'default-avatar.png',
    DEFAULT_BOOK_COVER: 'default-book-cover.jpg'
};

// پیام‌های خطا و موفقیت
const MESSAGES = {
    // پیام‌های مربوط به کاربر
    USER: {
        NOT_FOUND: 'کاربر مورد نظر یافت نشد',
        ALREADY_EXISTS: 'کاربری با این ایمیل قبلاً ثبت شده است',
        INVALID_CREDENTIALS: 'ایمیل یا رمز عبور اشتباه است',
        PASSWORD_CHANGED: 'رمز عبور با موفقیت تغییر کرد',
        RESET_EMAIL_SENT: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد',
        INVALID_TOKEN: 'توکن نامعتبر یا منقضی شده است'
    },
    // پیام‌های مربوط به کتاب
    BOOK: {
        NOT_FOUND: 'کتاب مورد نظر یافت نشد',
        CREATED: 'کتاب با موفقیت ایجاد شد',
        UPDATED: 'کتاب با موفقیت به‌روزرسانی شد',
        DELETED: 'کتاب با موفقیت حذف شد',
        ISBN_EXISTS: 'کتابی با این شابک قبلاً ثبت شده است'
    },
    // پیام‌های مربوط به نظرات
    REVIEW: {
        NOT_FOUND: 'نظر مورد نظر یافت نشد',
        ALREADY_EXISTS: 'شما قبلاً برای این کتاب نظر ثبت کرده‌اید',
        CREATED: 'نظر شما با موفقیت ثبت شد',
        UPDATED: 'نظر شما با موفقیت به‌روزرسانی شد',
        DELETED: 'نظر با موفقیت حذف شد'
    },
    // پیام‌های عمومی
    GENERAL: {
        SERVER_ERROR: 'خطای سرور',
        UNAUTHORIZED: 'دسترسی غیرمجاز',
        FORBIDDEN: 'شما مجوز انجام این عملیات را ندارید',
        VALIDATION_ERROR: 'خطا در اعتبارسنجی داده‌ها'
    }
};

// کدهای وضعیت HTTP
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
};

// تنظیمات اعتبارسنجی
const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    ISBN_PATTERN: /^(?:\d{10}|\d{13})$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// تنظیمات پاگینیشن
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// config/constants.js
exports.ERRORS = {
    AUTH: {
      INVALID_TOKEN: 'توکن نامعتبر است',
      TOKEN_EXPIRED: 'توکن منقضی شده است',
      PROVIDE_EMAIL_PASSWORD: 'لطفا ایمیل و رمز عبور را وارد کنید',
      INVALID_CREDENTIALS: 'ایمیل یا رمز عبور اشتباه است',
      EMAIL_EXISTS: 'این ایمیل قبلا ثبت شده است'
    },
    USER: {
      NOT_FOUND: 'کاربر یافت نشد'
    }
  };
  

module.exports = {
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    UPLOAD_CONFIG,
    MESSAGES,
    HTTP_STATUS,
    VALIDATION,
    PAGINATION
};
