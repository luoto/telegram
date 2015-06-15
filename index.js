var _ = require('lodash');
var express = require('express');
var session = require('express-session');
var fixtures = require('./fixtures');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var shortid = require('shortid');
var passport = require('./auth');

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
    var userId = req.params.userId;
    var user = _.find(fixtures.users, { id: userId });

    if (!user) {
        res.sendStatus(404);
    }

    res.send({ user: user });
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
    var user = req.body.user;

    if (_.find(fixtures.users, { id: user.id })) {
        res.sendStatus(409);
    }

    user.followingIds = [];
    fixtures.users.push(user);

    // establish session
    req.login(user, function(err) {
      res.sendStatus(200);
    });
});

app.post('/api/tweets', ensureAuthentication, function(req, res) {
    var tweet = req.body.tweet;


    tweet.created = Math.floor(Date.now() / 1000);
    tweet.id = shortid.generate();

    // overwrite the userId field with the authenticated user id
    tweet.userId = req.user.id;

    fixtures.tweets.push(tweet);

    res.send({
        tweet: tweet
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

var server = app.listen(3000, '127.0.0.1');


function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }
  else {
    res.sendStatus(403);
  }
}

module.exports = server;
