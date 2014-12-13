var async = require('async');
var mongoose = require('../libs/mongoose');
var config = require('../config');

async.series([
    openConnection,
    dropDatabase,
    requireModels,
    createUsers
], function(err, results) {
    console.log(arguments);
    mongoose.disconnect();
    process.exit(err ? 1: 0);
});

function openConnection(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
    console.log('Database %s was dropped', config.get('mongoose:uri'));
}

function requireModels(callback) {
    require('../models/user');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    var users = [
        { username: 'admin', password: '00000'},
        { username: 'Ying', password: '11111'},
        { username: 'Victor', password: '22222'}
    ];

    async.each(users, function(userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}