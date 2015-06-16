var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session  = require('express-session'),
    passport = require('../auth')


module.exports = function(app) {
  app.use(bodyParser.json())
  app.use(cookieParser())

  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

  app.use(passport.initialize())
  app.use(passport.session())
}
