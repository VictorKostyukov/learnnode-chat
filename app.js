var express = require('express');
var session = require('express-session');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');

var HttpError = require('./error').HttpError;
var mongoose = require('./libs/mongoose');
var config = require('./config');

var routes = require('./routes/index');
var users = require('./routes/users');
var user = require('./routes/user');
var login = require('./routes/login');
var chat = require('./routes/chat');
var logout = require('./routes/logout');

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, './public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var sessionStore = require('./libs/sessionStore');

app.use(session({
    secret: config.get('session:secret'),
    resave: config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    name: config.get('session:name'),
    cookie: config.get('session: cookie'),
    store: sessionStore
}));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));

app.use('/', routes);
app.use('/users', users);
app.use('/user', user);
app.use('/login', login);
app.use('/chat', chat);
app.use('/logout', logout);

app.use(function(req, res, next) {
    next(new HttpError(404, 'Page Not Found'));
});

app.use(function(err, req, res, next) {
    if (typeof err == 'number') { // called as next(404);
        err = new HttpError(err);
    }
    if(err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        console.log(err);
        res.sendHttpError(new HttpError(err.status || 500));
    }
});

module.exports = app;