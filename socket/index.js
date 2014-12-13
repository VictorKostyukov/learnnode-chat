var async = require('async');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');

var log = require('../libs/log')(module);
var config = require('../config');
var sessionStore = require('../libs/sessionStore');
var HttpError = require('../error').HttpError;
var User = require('../models/user').User;

function LoadSession(sid, callback) {
    sessionStore.load(sid, function(err, session) {
        if(arguments.length == 0) {
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function LoadUser(session, callback) {
    if(!session.userid) {
        log.debug('Session %s is anonymous', session.id);
        return callback(null, null);
    }

    log.debug('Retrieving user', session.userid);

    User.findById(session.userid, function(err, user) {
        if(err) return callback(err);

        if(!user) {
            return callback(null, null);
        }
        callback(null, user);
    });
}

var temphack = '';

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    io.set('origins', 'localhost:*');
    //io.set('logger', log);

    io.set('authorization', function(handshake, callback) {
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:name')];
                var sid = cookieParser.signedCookie(sidCookie,config.get('session:secret'));
                log.debug('sid =', sid);

                LoadSession(sid, callback);
            },
            function(session, callback) {
                if (!session) {
                    callback(new HttpError(401, 'No Session'));
                }
                handshake.session = session;
                LoadUser(session, callback);
            },
            function(user, callback) {
                if(!user) {
                    callback(new HttpError(403, 'Anonymous session may not connect'));
                }
                //handshake.user = user;
                temphack = user;
                callback(null);
            }
        ], function(err) {
            if(!err) {
                return callback(null, true);
            }
            if(err instanceof  HttpError) {
                return callback(null, false);
            }
            callback(err);
        });
    });

    io.on('session:reload', function(sid) {
        log.debug('session:reload received');
        var clients = io.sockets.clients();

        clients.forEach(function(client) {
            if (client.handshake.session.id != sid) return;

            loadSession(sid, function(err, session) {
                if (err) {
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }

                if (!session) {
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            });
        });
    });

    io.on('connection', function (socket) {
        socket.handshake.user = temphack;

        var username = socket.handshake.user.get('username');

        console.log('User ' + username + ' joined');
        socket.broadcast.emit('join', username);

        socket.on('message', function (text, callback) {
            socket.broadcast.emit('message', username, text);
            callback && callback();
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        });
    });
    return io;
};