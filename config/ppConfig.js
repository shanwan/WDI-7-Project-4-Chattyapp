const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user')
// using email instead of username
// A successful local login will yield the user a JSON Web Token to use to authenticate future requests automatically.

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (err) return done(err)
    if (!user) return done(null, false)
    if (!user.validPassword(password)) return done(null, false)
    return done(null, user)
  })
}))

//  JWT authentication options
const jwtOptions = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  // Telling Passport where to find the secret - need to put this in .env file
  secretOrKey: process.env.JWT_SECRET
}

// set up our JWT login strategy and pass our options through
passport.use(new JwtStrategy(jwtOptions, function (payload, done) {
  console.log(payload)
  User.findById(payload._id, function (err, user) {
    console.log(payload)
    if (err) {
      return done(err, false)
    }
    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
})
)

module.exports = passport
