var Schema = require('mongoose').Schema;

var tweetSchema = new Schema({
  userId: String,
  created: Number,
  text: String
});

tweetSchema.methods.toClient = function() {
  return {
    id: this._id,
    text: this.text,
    created: this.created,
    userId: this.userId
  }
};

module.exports = tweetSchema;
