require('dotenv').config()
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
const chatController = require('./controllers/chatController')
const Message = require('./models/message')
const unirest = require('unirest')
const app = express()

mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chatertain')

app.set('view engine', 'ejs')
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(ejsLayouts)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())
app.use(passport.session())
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

const server = app.listen(process.env.PORT || 3000)
console.log('Server UP')
// io listens to server
const io = require('socket.io').listen(server)
global.io = io
console.log('websocket up')

// Set socket.io listeners.
io.on('connection', function (socket) {
  console.log('a user connected')
  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
  // on chat to start messages
  socket.on('chat', function (msg) {
    socket.emit('chat', msg)
  })
  socket.on('messages', function (data) {
    // socket.emit('broad', data)
    // get API translation
    // console.log('am i consuming API?')
    unirest.get('https://yoda.p.mashape.com/yoda?sentence=' + data.composedMessage)
    .header('X-Mashape-Key', '5ZGQXOI7M0mshOp7RqMZoqeoWvrwp15JVFLjsnBzw4v4s1bi6p')
    .header('Accept', 'text/plain')
    .end(function (result) {
      console.log('am i consuming API?')
      console.log('am i posting new msg into database?', data)
      console.log('what is the chatroomid?', data.chatroomId)
      const reply = new Message({
        chatroomId: data.chatroomId,
        body: data.composedMessage,
        author: data.author,
        authorName: data.authorName,
        translate: result.body
      })
      reply.save(function (err, messages) {
        if (err) {
          console.log(err)
          return
        }
        // to broadcast the message
        console.log('is this broadcasting?')
        io.sockets.emit('broad', messages)
        // socket.emit('broad', messages)
        // socket.broadcast.emit('broad', messages)
      })
    })
  })
})
