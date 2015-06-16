var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fixtures = require('./fixtures');
var conn = require('./db');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    conn.model('User').findOne({ id: id}, done);
});


passport.use(new LocalStrategy(verify));

function verify(username, password, done) {
  var user = _.find(fixtures.users, 'id', username);

  if(!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }

  if(password !== user.password) {
    return done(null, false, { message: 'Incorrect password.' });
  }

  return done(null, user);
};


module.exports = passport;
