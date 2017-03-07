require('dotenv').config({ silent: true })
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const passport = require('./config/ppConfig')
const session = require('express-session')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn')
const userAuth = require('./controllers/auth')
const ejsLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const express = require('express')
const morgan = require('morgan')
const app = express()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chatertain')

mongoose.Promise = global.Promise
app.set('view engine', 'ejs')
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(ejsLayouts)
app.use(methodOverride('_method'))

app.use(function (req, res, next) {
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next()
})

app.get('/', function (req, res) {
  res.render('/auth/login')
})

app.use('/auth', userAuth)

app.get('/', isLoggedIn, function (req, res) {
  res.render('index')
})

// app.use(isLoggedIn)

// app.use('/products', productController)
// app.use('/products', msgController)

// below from the online tutorial
// app.use(express.favicon())
// app.use(app.router)

// app.get('/', routes.index)
// app.get('/users', user.list)

var server = app.listen(process.env.PORT || 3000)
console.log('Server UP')

module.exports = server
