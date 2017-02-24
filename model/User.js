var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  userURL: String,
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserModel", userSchema);

