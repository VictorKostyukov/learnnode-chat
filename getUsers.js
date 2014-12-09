var User = require('./models/user').User;

User.find({}, function(err, users) {
console.log(users);

});