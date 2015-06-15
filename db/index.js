var mongoose = require('mongoose');
var config = require('../config');
var user = require('./schemas/user');
var tweet = require('./schemas/tweet');

var connection = mongoose.createConnection(
  config.get('database:host'),
  config.get('database:name'),
  config.get('database:port')
);

connection.model('User', user);
connection.model('Tweet', user);

module.exports = connection;
