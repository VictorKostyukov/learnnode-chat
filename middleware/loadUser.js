var User = require('models/user').User;

module.exports = function(req, res, next) {
    res.locals.user = null;
    if(!req.session.userid) return next();
    User.findById(req.session.userid, function(err,user) {
        if(err) return next(err);
        req.user = res.locals.user = user;
        next();
    });
};