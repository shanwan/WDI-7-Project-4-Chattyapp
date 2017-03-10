require('dotenv').config({ silent: true })
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')
const passport = require('./config/ppConfig')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn')
const userAuth = require('./controllers/auth')
const ejsLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const morgan = require('morgan')
const chatController = require('./controllers/chatController')
const Message = require('./models/message')
const unirest = require('unirest')
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

const server = app.listen(process.env.PORT || 3000)
console.log('Server UP')
// io listens to server
const io = require('socket.io').listen(server)
console.log('websocket up')

// Set socket.io listeners.
io.on('connection', function (socket) {
  console.log('a user connected')
  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
  socket.on('chat', function (msg) {
    socket.broadcast.emit('chat', msg)
  })
  socket.on('messages', function (data) {
    // socket.emit('broad', data)
    // console.log('am i consuming API?')
    unirest.get('https://yoda.p.mashape.com/yoda?sentence=' + data.composedMessage)
    .header('X-Mashape-Key', '5ZGQXOI7M0mshOp7RqMZoqeoWvrwp15JVFLjsnBzw4v4s1bi6p')
    // unirest.get('http://api.funtranslations.com/translate/pirate.json?text=' + data.composedMessage)
    .header('Accept', 'text/plain')
    .end(function (result) {
      console.log('am i consuming API?')
      // let accessTranslate = JSON.parse(JSON.stringify(result.body))
      // JSON.stringify(accessTranslate.contents.translated)
      // console.log('what is result from API?', result.status, result.headers, result.body)
      console.log('am i posting new msg into database?', data)
      const reply = new Message({
        chatroomId: mongoose.Types.ObjectId(data.chatroomId._id),
        body: data.composedMessage,
        author: data.author,
        authorName: data.authorName,
        translate: result.body
      })
      reply.save(function (err, messages) {
        if (err) {
          console.log(err)
          return
          // next(err)
        }
        console.log('is this broadcasting?')
        socket.emit('broad', messages)
        // socket.broadcast.emit('broad', messages)
      })
    })
  })
})

module.exports = server; io
