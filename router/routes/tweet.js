var express = require('express'),
    router = express.Router(),
    conn = require('../../db'),
    ObjectId = require('mongoose').Types.ObjectId,
    ensureAuthentication = require('../../middleware/ensureAuthentication');


// GET /api/tweets
router.get('/', function(req, res) {
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


// GET /api/tweets/:tweetId
router.get('/:tweetId', function(req, res) {
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


// DELETE /api/tweets/:tweetId
router.delete('/:tweetId', ensureAuthentication, function(req, res) {
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


// POST /api/tweets
router.post('/', ensureAuthentication, function(req, res) {
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


module.exports = router;
