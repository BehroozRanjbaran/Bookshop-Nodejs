const jwt = require('jsonwebtoken');
const { ERRORS } = require('../config/constants');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: ERRORS.AUTH.INVALID_TOKEN 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: ERRORS.USER.NOT_FOUND 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: ERRORS.AUTH.TOKEN_EXPIRED 
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: ERRORS.AUTH.INVALID_TOKEN 
        });
    }
};

module.exports = auth;
