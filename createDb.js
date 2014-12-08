var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var format = require('util').format;

// Connection URL
var url = 'mongodb://localhost:27017/test';

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {

    assert.equal(null, err);
    console.log("Connected correctly to server");

/*
    // Basic example
    var collection = db.collection("test_insert");
    collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count) {
            console.log(format("count = %s", count));
        });

        collection.find().toArray(function(err, results) {
            console.dir(results);

            db.close();
        })
    })
*/

    // Advanced example
    removeDocuments(db, function() {
        insertDocuments(db, function () {
            updateDocument(db, function () {
                db.close();
            });
        });
    });
});

var removeDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');

    // Remove all documents
    collection.remove({}, function(err, result) {
        assert.equal(err, null);
        console.log("All documents deleted");
        callback(result);
    });
};


var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');

    // Insert some documents
    collection.insert([
        {a : 1}, {a : 2}, {a : 3}
    ], function(err, result) {
        assert.equal(err, null);
        //assert.equal(3, result.result.n);
        //assert.equal(3, result.ops.length);
        assert.equal(3, result.length);
        console.log("Inserted 3 documents into the document collection");
        callback(result);
    });
};

var updateDocument = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');

    // Update document where a is 2, set b equal to 1
    collection.update({ a : 3 }
        , { $set: { b : 1 } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};