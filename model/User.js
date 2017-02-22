var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  userURL: String
});

module.exports = mongoose.model("UserModel", userSchema);

