var User = require('./models/user').User;

var user = new User({
    username: "Tester",
    password: "secret"
});

user.save(function(err, user, affected) {
    console.log(arguments);
});