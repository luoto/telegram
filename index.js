var _ = require('lodash');
var express = require('express');
var fixtures = require('./fixtures');
var shortid = require('shortid');
var config = require('./config');
var conn = require('./db');
var ObjectId = require('mongoose').Types.ObjectId;

var app = express();
var ensureAuthentication = require('./middleware/ensureAuthentication');
require('./middleware')(app);

app.get('/api/users/:userId', function(req, res) {
    // find and send user in db
    conn.model('User').findOne({ id: req.params.userId }, function(err, user) {
      if (err) {
        res.sendStatus(500);
      }
      if (!user) {
          res.sendStatus(404);
      }
      res.send({ user: user });
    });
});


app.get('/api/tweets', function(req, res) {
    var userId = req.query.userId;
    if(!userId) {
        return res.sendStatus(400);
    }

    var query = { userId: userId};
    var options = { sort: { created: -1 }};
    var Tweet = conn.model("Tweet");

    Tweet.find(query, null, options, function(err, tweets) {
      if (err) {
        return res.sendStatus(500)
      }
      var responseTweets = tweets.map(function(tweet) { return tweet.toClient() })
      res.send({ tweets: responseTweets })
    });
});


app.get('/api/tweets/:tweetId', function(req, res) {
    var tweetId = req.params.tweetId;

    conn.model('Tweet').findById(tweetId, function(err, tweet) {
      if (err) {
        return res.sendStatus(500);
      }
      if (!tweet) {
          res.sendStatus(404);
      }
      else {
          res.send({ tweet: tweet.toClient() });
      }
    });
});


app.post('/api/users', function(req, res) {
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

app.post('/api/tweets', ensureAuthentication, function(req, res) {
    var tweet = req.body.tweet;
    tweet.userId = req.user.id;
    tweet.created = Math.floor(Date.now() / 1000);

    // create tweet and send back to client
    conn.model('Tweet').create(tweet, function(err, tweet) {
      if (err) {
        return res.sendStatus(500);
      }
      res.send({ tweet: tweet.toClient() });
    });
});

app.post('/api/auth/login', function(req, res, next) {
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


app.post('/api/auth/logout', function(req, res) {
  // clear session
  req.logout();
  res.sendStatus(200);
});


app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res) {
    var Tweet = conn.model('Tweet');
    var tweetId = req.params.tweetId;

    if (!ObjectId.isValid(tweetId)) {
      return res.sendStatus(400);
    }

    Tweet.findById(tweetId, function(err, tweet) {
      if (err) {
        return res.sendStatus(500);
      }

      if (!tweet) {
        return res.sendStatus(404);
      }

      if (tweet.userId !== req.user.id) {
       return res.sendStatus(403);
      }

      Tweet.findByIdAndRemove(tweetId, function(err) {
        if (err) {
          return res.sendStatus(500);
        }
        res.sendStatus(200);
      });

    });

});


app.put('/api/users/:userId', ensureAuthentication, function(req, res) {
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


var server = app.listen(config.get('server:port'), config.get('server:host'));


function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.sendStatus(403);
  }
}


module.exports = server;
