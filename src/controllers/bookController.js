const Book = require('../models/Book');
const AppError = require('../utils/appError');
const { MESSAGES, HTTP_STATUS, PAGINATION } = require('../config/constants');

exports.getAllBooks = async (req, res, next) => {
    try {
        const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .skip(skip)
            .limit(limit)
            .populate('reviews');

        const total = await Book.countDocuments();

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: {
                books,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.getBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id).populate('reviews');
        
        if (!book) {
            return next(new AppError(MESSAGES.BOOK.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: { book }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.createBook = async (req, res, next) => {
    try {
        const existingBook = await Book.findOne({ isbn: req.body.isbn });
        if (existingBook) {
            return next(new AppError(MESSAGES.BOOK.ISBN_EXISTS, HTTP_STATUS.CONFLICT));
        }

        const book = await Book.create(req.body);
        
        res.status(HTTP_STATUS.CREATED).json({
            status: 'success',
            message: MESSAGES.BOOK.CREATED,
            data: { book }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.updateBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!book) {
            return next(new AppError(MESSAGES.BOOK.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: MESSAGES.BOOK.UPDATED,
            data: { book }
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};

exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return next(new AppError(MESSAGES.BOOK.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.NO_CONTENT).json({
            status: 'success',
            message: MESSAGES.BOOK.DELETED,
            data: null
        });
    } catch (error) {
        next(new AppError(MESSAGES.GENERAL.SERVER_ERROR, HTTP_STATUS.SERVER_ERROR));
    }
};
