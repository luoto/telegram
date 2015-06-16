var _ = require('lodash');
var express = require('express');
var session = require('express-session');
var fixtures = require('./fixtures');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var shortid = require('shortid');
var passport = require('./auth');
var config = require('./config');
var conn = require('./db');

var app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// depends on the other middleware
app.use(passport.initialize());
app.use(passport.session());

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
        res.sendStatus(400);
    }

    var tweets = _.where(fixtures.tweets, { userId: userId });
    var sortedTweets = tweets.sort(function(t1, t2) {
        return t2.created - t1.created;
    });

    res.send({
        tweets: sortedTweets
    });
});

app.get('/api/tweets/:tweetId', function(req, res) {
    var tweetId = req.params.tweetId;

    var tweet = _.find(fixtures.tweets, { id: tweetId });

    if (!_.isUndefined(tweet)) {
        res.send({ tweet: tweet });
    }
    else {
        res.sendStatus(404);
    }
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
    var tweetId = req.params.tweetId;
    var tweet = _.find(fixtures.tweets, { id: tweetId });

    if (req.user.id != tweet.userId){
       return res.sendStatus(403);
    }

    if (!_.isUndefined(tweet)) {
        _.remove(fixtures.tweets, function(tweet) {
            return tweet.id == tweetId;
        });

        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
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
