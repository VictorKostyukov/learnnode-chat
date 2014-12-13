var express = require('express');
var router = express.Router();
var checkAuth = require('../middleware/checkAuth');

router.get('/', checkAuth);

router.get('/', function(req, res) {
    res.render('chat');
});

module.exports = router;
