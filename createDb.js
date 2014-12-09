var async = require('async');
var mongoose = require('./libs/mongoose');
var config = require('./config');
var User = require('./models/user').User;


mongoose.connection.on('open', function() {
    var db = mongoose.connection.db;

    db.dropDatabase(function(err) {
        if (err) throw err;
        console.log('Database %s was dropped', config.get('mongoose:uri'));

        async.parallel([
            function(callback) {
                var user1 = new User({ username: 'admin', password: '00000'});
                user1.save(function(err) {
                    callback(err, user1);
                });
            },
            function(callback) {
                var user2 = new User({ username: 'Ying', password: '11111'});
                user2.save(function(err) {
                    callback(err, user2);
                });
            },
            function(callback) {
                var user3 = new User({ username: 'Victor', password: '22222'});
                user3.save(function(err) {
                    callback(err, user3);
                });
            }
        ], function(err, results) {
            console.log(arguments);
            mongoose.disconnect();
        });

/*
        var user1 = new User({ username: 'admin', password: '00000'});
        var user2 = new User({ username: 'Ying', password: '11111'});
        var user3 = new User({ username: 'Victor', password: '22222'});

        user1.save();
        user2.save();
        user3.save();

        mongoose.disconnect();
*/
    })
})