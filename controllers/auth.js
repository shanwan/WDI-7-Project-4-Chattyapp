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
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password
  }, function (err, createdUser) {
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/auth/signup')
    } else {
      passport.authenticate('local', {
        successRedirect: '/chats',
        successFlash: 'Account created and logged in.'
      })(req, res)
    }
  })
})

// to login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/index',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password',
  successFlash: 'You have logged in.'
})
)

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'You have logged out')
  res.redirect('/auth/login')
})

module.exports = router
