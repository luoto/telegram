var express = require('express'),
    router = express.Router(),
    conn = require('../../db'),
    ensureAuthentication = require('../../middleware/ensureAuthentication');


// GET /api/users/:userId
router.get('/:userId', function (req, res) {
  // find and send user in db
  conn.model('User').findOne({ id: req.params.userId }, function(err, user) {
    if (err) {
      res.sendStatus(500);
    }
    if (!user) {
        res.sendStatus(404);
    }
    res.send({ user: user.toClient() });
  });
});


// POST /api/users/
router.post('/', function (req, res) {
  // grab model reference
  var User = conn.model('User');

  // save user to db
  var user = new User(req.body.user);
  user.save(function(err) {
    if (err) {
      // if duplicate send 409 - conflict
      if (err.code === 11000) {
        return res.sendStatus(409);
      }
    }

    // establish session
    req.login(user, function(err) {
      if (err) {
        return res.sendStatus(500);
      }
      res.sendStatus(200);
    });

  });
});

// POST /api/users/:userId/follow
router.post('/:userId/follow', ensureAuthentication, function(req, res) {
  var User = conn.model('User'),
      userId = req.params.userId;

      User.findByUserId(userId, function(err, user) {
        if (err) {
          return res.sendStatus(500);
        }

        if (!user) {
          return res.sendStatus(403);
        }

        req.user.follow(userId, function(err) {
          if (err) {
            return res.sendStatus(500);
          }
          res.sendStatus(200);
        });
        
      });
});

// PUT /api/users/:userId
router.put('/:userId', ensureAuthentication, function(req, res) {
  // ensure sure that the person that is making changes to his own account
  if (req.params.userId !== req.user.id) {
    return res.sendStatus(403);
  }

  // parameters for update
  var query = { id: req.params.userId };
  var update = { password: req.body.password };

  // update password
  conn.model('User').findOneAndUpdate(query, update, function(err, user) {
      if (err) {
        return res.sendStatus(500);
      }
      res.sendStatus(200);
    }
  );
});


module.exports = router;
