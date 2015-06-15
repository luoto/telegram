var Schema = require('mongoose').Schema;

var tweetSchema = new Schema({
  userId: String,
  created: Number,
  text: String
});

module.exports = tweetSchema;
