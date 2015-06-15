var nconf = require('nconf');
var path = require('path');

nconf.env();

var configFile = 'config-' + process.env.NODE_ENV + '.json';
nconf.file(path.join(__dirname, configFile));

module.exports = nconf;
