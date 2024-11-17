const admin = (req, res, next) => {
    // بررسی دسترسی admin
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = admin;
