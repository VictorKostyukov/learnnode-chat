var express = require('express');
var router = express.Router();

var ObjectID = require('mongodb').ObjectID;

var User = require('../models/user').User;
var HttpError = require('../error').HttpError;



/* GET user by id. */
router.get('/:id', function(req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        return next(new HttpError(404, "UserId Invalid"));
        return next(err);
    }

    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);
        if (!user) {
            return next(new HttpError(404, "User Not Found"));
        }
        res.json(user);
    });
});

module.exports = router;
