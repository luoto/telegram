var express = require('express'),
    router = express.Router(),
    passport = require('../../auth');

// POST /api/auth/login
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.sendStatus(500);
    }
    if (!user) {
      return res.sendStatus(403);
    }

    req.login(user, function(err) {
        if (err) {
          return res.sendStatus(500);
        }
        return res.send({ user: user });
    });
  })(req, res, next);
});


// POST /api/auth/logout
router.post('/logout', function(req, res) {
  // clear session
  req.logout();
  res.sendStatus(200);
});


module.exports = router;
