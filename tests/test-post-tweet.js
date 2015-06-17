process.env.NODE_ENV = 'test';

var config = require('../config'),
    mongoose = require('mongoose');

describe("Test suite POST /api/tweets", function() {

  before(function(done) {
    var connection = mongoose.createConnection(
      config.get('database:host'),
      config.get('database:name'),
      config.get('database:port'),
      function(err) {
        if (err) {
          return done(err);
        }
        connection.db.dropDatabase(done);
      }
    );
  });

  it("test case scenario 1", function(done) {
    var request = require('supertest'),
        app = require('../index');

    var tweet = { "tweet": {"text": "Test tweet", "userId": "test"}};

    request(app)
      .post('/api/tweets')
      .send(tweet)
      .expect(403, done);
  });


  it("test case scenario 2", function(done) {
    done(null);
  });

});
