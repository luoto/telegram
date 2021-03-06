var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fixtures = require('./fixtures');
var conn = require('./db');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    conn.model('User').findOne({ id: id }, done);
});


passport.use(new LocalStrategy(verify));


function verify(username, password, done) {
  conn.model('User').findOne({ id: username }, function(err, user) {
    if(err) {
      return done(err);
    }

    if(!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    var bcrypt = require('bcrypt');
    var hash = user.password;
    bcrypt.compare(password, hash, function(err, res) {
      if (res == false) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  });
};


module.exports = passport;
