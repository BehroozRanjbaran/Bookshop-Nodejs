const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { MESSAGES, HTTP_STATUS, JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

const signToken = id => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

exports.signup = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError(MESSAGES.USER.ALREADY_EXISTS, HTTP_STATUS.CONFLICT));
        }

        const user = await User.create({
            email,
            username,
            password
        });

        // Remove password from output
        user.password = undefined;

        const token = signToken(user._id);

        res.status(HTTP_STATUS.CREATED).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError(MESSAGES.GENERAL.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError(MESSAGES.USER.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
        }

        const token = signToken(user._id);

        // Remove password from output
        user.password = undefined;

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return next(new AppError(MESSAGES.USER.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = signToken(user._id);

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: MESSAGES.USER.PASSWORD_CHANGED,
            token
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};
