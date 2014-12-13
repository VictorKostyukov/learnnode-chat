var HttpError = require('../error').HttpError;

module.exports = function(req, res, next) {
    if (!req.session.userid) {
        return next(new HttpError(401, 'You are not authorized'))
    }
    next();
}