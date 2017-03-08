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
const socketEvents = require('./socketEvents')
const chatController = require('./controllers/chatController')
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
  res.render('auth/login')
})

app.use('/auth', userAuth)

app.get('/index', isLoggedIn, function (req, res) {
  res.render('index')
})

app.use(isLoggedIn)

app.use('/chats', chatController)
// app.use('/products', msgController)

const server = app.listen(process.env.PORT || 3000)
console.log('Server UP')
// io listens to server
const io = require('socket.io').listen(server)
console.log('websocket up')
socketEvents(io)

// Set socket.io listeners.
io.on('connection', function (socket) {
  console.log('a user connected')
  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
  socket.on('join', function (data) {
    console.log(data)
    socket.emit('messages', 'Hello from server')
  })
  socket.on('chat', function (msg) {
    socket.broadcast.emit('chat', msg)
  })
  socket.on('messages', function (data) {
    socket.emit('broad', data)
    socket.broadcast.emit('broad', data)
  })
})

module.exports = server; io
