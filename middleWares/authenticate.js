const jwt = require('jsonwebtoken');

const { HttpError } = require('../helpers');
const User = require('../models/user');
const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return next(HttpError(401, "Authorization header is missing"));
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token) {
        return next(HttpError(401, "Invalid authorization format"));
    }

    try {
        const { contactId } = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(contactId);
        if (!user || !user.token) {
            return next(HttpError(401, "User not found"));
        }
        req.user = user;
        next();
    } catch (error) {
        return next(HttpError(401, "Invalid or expired token"));
    }
};

module.exports = authenticate;