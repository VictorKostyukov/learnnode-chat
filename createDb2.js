var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var schema = mongoose.Schema({
    name: String
});
schema.methods.meow = function() {
    console.log(this.get('name') + " says: Meow!");
}

var Cat = mongoose.model('Cat', schema);

var kitty = new Cat({ name: 'Murzik' });

kitty.save(function (err) {
    kitty.meow();
    console.log(arguments);
});