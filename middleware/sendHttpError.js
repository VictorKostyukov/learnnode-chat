module.exports = function(req, res, next) {

    res.sendHttpError = function(error) {

        res.status(error.status);
        //res.send('[sendHttpError.js] HttpError happened');

        if(res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.json(error);
        } else {
            res.render("error", { title: '[middleware/sendHttpError.js] Error title', error: error });
        }
    };

    next();
};