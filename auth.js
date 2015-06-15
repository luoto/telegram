var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fixtures = require('./fixtures');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    var user = _.find(fixtures.users, 'id', id);

    if (_.isUndefined(user)) {
        done(null, false);
    }
    else {
        done(null, user);
    }
});

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

passport.use(new LocalStrategy(verify));

module.exports = passport;
