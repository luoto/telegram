var _ = require('lodash'),
    express = require('express'),
    config = require('./config'),
    app = express();

require('./middleware')(app);
require('./router')(app);

var server = app.listen(config.get('server:port'), config.get('server:host'));

module.exports = server;
