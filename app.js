var express = require('express');
var session = require('express-session');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');

var HttpError = require('./error').HttpError;
var mongoose = require('./libs/mongoose')
var config = require('./config');

var routes = require('./routes/index');
var users = require('./routes/users');
var user = require('./routes/user');

var app = express();

// view engine setup
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.get('session:secret'),
    resave: config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    name: config.get('session:name'),
    cookie: config.get('session: cookie'),
    store: new MongoStore({mongoose_connection: mongoose.connection})
}));

app.use(function(req,res,next) {
    req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
    res.send("Visits: " + req.session.numberOfVisits);
});

app.use(require('./middleware/sendHttpError'));

app.use('/', routes);
app.use('/users', users);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(new HttpError(404, '[app.js] Page Not Found'));
});


/*** error handlers ***/

app.use(function(err, req, res, next) {
    if (typeof err == 'number') { // called as next(404);
        err = new HttpError(err);
    }
    if(err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        next(err);
    }
});

// clean up later here
// setting views at this line doesn't help
//app.set('views', path.join(__dirname, 'views'));

// development error handler: will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: '[app.js] title from app.js; it shouldn\'t be there!!!'
        });
    });
}

// production error handler: no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: '[app.js] title from app.js; it shouldn\'t be there!!!'
    });
});

module.exports = app;