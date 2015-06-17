var bcrypt = require('bcrypt');
var Schema = require('mongoose').Schema;
var SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
  id: { type: String, unique: true},
  name: String,
  email: {type: String, unique: true},
  password: String,
  followingIds: {type: [String], default: []}
});

userSchema.pre('save', function(next) {
  var _this = this;

  if (!_this.isModified('password')) {
    return next();
  }

  bcrypt.hash(_this.password, SALT_WORK_FACTOR, function(err, hash) {
    if (err) {
      return next(err);
    }
    _this.password = hash;
    next();
  });
});


userSchema.methods.toClient = function() {
  return {
    id: this.id,
    name: this.name
  };
}

module.exports = userSchema;
