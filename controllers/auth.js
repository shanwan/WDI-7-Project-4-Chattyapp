const express = require('express')
const User = require('../models/user')
const passport = require('../config/ppConfig')
const router = express.Router()

router.get('/signup', function (req, res) {
  res.render('auth/signup')
})

router.get('/login', function (req, res) {
  res.render('auth/login')
})

router.post('/signup', function (req, res) {
  User.create({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  }, function (err, createdUser) {
    if (err) {
      req.flash('error', 'Could not create user account')
      res.redirect('/auth/signup')
    } else {
      passport.authenticate('local', {
        successRedirect: '/products/',
        successFlash: 'Account created and logged in'
      })(req, res)
    }
  })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/products/',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password',
  successFlash: 'You have logged in'
})
)

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'You have logged out')
  res.redirect('/index')
})

module.exports = router
