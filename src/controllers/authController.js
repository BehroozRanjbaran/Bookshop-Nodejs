// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ERRORS } = require('../config/constants');

// ایجاد توکن JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// پاسخ استاندارد با توکن
const createSendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  // حذف پسورد از خروجی
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user }
  });
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // بررسی وجود کاربر با ایمیل تکراری
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: ERRORS.AUTH.EMAIL_EXISTS
      });
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      username,
      email,
      password
    });

    createSendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // بررسی ورود ایمیل و پسورد
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: ERRORS.AUTH.PROVIDE_EMAIL_PASSWORD
      });
    }

    // پیدا کردن کاربر و چک کردن پسورد
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: ERRORS.AUTH.INVALID_CREDENTIALS
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
};
