const express = require('express')
const User = require('../models/user')
const passport = require('../config/ppConfig')
const jwt = require('jsonwebtoken')
// The requireAuth middleware we built attaches the user object to req.user.
// const requireAuth = passport.authenticate('jwt', { session: false })
// const requireLogin = passport.authenticate('local', { session: false })
const router = express.Router()

// generate a JSON web token from the user object we pass in. a lot of information to eventually store in a cookie.
function generateToken (user) {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: 10080 // in seconds
  })
}

router.get('/signup', function (req, res) {
  res.render('auth/signup')
})

router.get('/login', function (req, res) {
  res.render('auth/login')
})

router.post('/signup', function (req, res) {
  User.create({
    email: req.body.email,
    firstName: req.body.profile.firstName,
    lastName: req.body.profile.lastName,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  }, function (err, createdUser) {
    if (err) {
      req.flash('error', 'Could not create user account')
      res.redirect('/auth/signup')
    } else {
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Account created and logged in'
      })(req, res)
    }
  })
})

// Set user info from request
function setUserInfo (request) {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    role: request.role
  }
}

// to login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password',
  successFlash: 'You have logged in'
}), function (req, res, next) {
  let userInfo = setUserInfo(req.user)
  res.status(200).json({
    token: 'JWT ' + generateToken(userInfo),
    user: userInfo
  })
})

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'You have logged out')
  res.redirect('/index')
})

module.exports = router
