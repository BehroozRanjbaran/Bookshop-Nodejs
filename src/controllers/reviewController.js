const Review = require('../models/Review');
const AppError = require('../utils/appError');
const { MESSAGES, HTTP_STATUS } = require('../config/constants');

exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'username')
            .populate('book', 'title');

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: { reviews }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId)
            .populate('user', 'username')
            .populate('book', 'title');

        if (!review) {
            return next(new AppError(MESSAGES.REVIEW.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: { review }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.createReview = async (req, res, next) => {
    try {
        const existingReview = await Review.findOne({
            user: req.user.id,
            book: req.params.bookId
        });

        if (existingReview) {
            return next(new AppError(MESSAGES.REVIEW.ALREADY_EXISTS, HTTP_STATUS.CONFLICT));
        }

        const review = await Review.create({
            ...req.body,
            user: req.user.id,
            book: req.params.bookId
        });

        res.status(HTTP_STATUS.CREATED).json({
            status: 'success',
            message: MESSAGES.REVIEW.CREATED,
            data: { review }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return next(new AppError(MESSAGES.REVIEW.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        if (review.user.toString() !== req.user.id) {
            return next(new AppError(MESSAGES.GENERAL.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        Object.assign(review, req.body);
        await review.save();

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: MESSAGES.REVIEW.UPDATED,
            data: { review }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return next(new AppError(MESSAGES.REVIEW.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        if (review.user.toString() !== req.user.id) {
            return next(new AppError(MESSAGES.GENERAL.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
        }

        await review.remove();

        res.status(HTTP_STATUS.NO_CONTENT).json({
            status: 'success',
            message: MESSAGES.REVIEW.DELETED,
            data: null
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};
