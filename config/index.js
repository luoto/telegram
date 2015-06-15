var fs = require('fs');
var nconf = require('nconf');
var path = require('path');

nconf.env();

if (process.env.NODE_ENV === 'prod') {
  var configPath = path.join(__dirname, 'config-prod.json');
}

if (process.env.NODE_ENV === 'dev') {
  var configPath = path.join(__dirname, 'config-dev.json');
}

if (process.env.NODE_ENV === 'test') {
  var configPath = path.join(__dirname, 'config-test.json');
}

nconf.file(configPath);

module.exports = nconf;
