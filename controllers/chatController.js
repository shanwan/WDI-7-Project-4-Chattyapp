const express = require('express')
const mongoose = require('mongoose')
const Chatroom = require('../models/chatroom')
const User = require('../models/user')
const Message = require('../models/message')
const router = express.Router()

mongoose.Promise = global.Promise

// View list of chatrooms
router.get('/', function (req, res, next) {
  console.log('User_id', req.user._id)
  Chatroom.find({ participants: req.user._id })
  .select('_id')
  .exec(function (err, chatrooms) {
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/index')
      return
    }
    res.render('listChat', {chatrooms: chatrooms})
  })
})

// brings up a new form
router.get('/new', function (req, res, next) {
  console.log('get new and render')
  res.render('new')
})

// get all messages in one chatroom - Retrieve single conversation
router.get('/:chatroomId', function (req, res, next) {
  console.log('get by chatroomId before', req.params)
  Message.find({ chatroomId: req.params.chatroomId })
  .select('createdAt body author translate authorName chatroomId')
  .sort('-createdAt')
  .populate({
    path: 'author chatroomId',
    select: 'firstName lastName participants'
  })
  .exec(function (err, messages) {
    console.log('what is messages?', messages)
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/index')
      return
    }
    res.render('chatroom', {messages: messages, newChatroom: req.params.chatroomId})
  })
})

// create new chatroom
router.post('/', function (req, res, next) {
  console.log('are we posting new conversation?')
  console.log('who is picked?', req.body.recipient)
  console.log('who is the creator?', req.user._id)
  if (!req.body.recipient) {
    req.flash('error', 'Please choose a valid recipient for your message.')
    res.redirect('/chats/new')
    return
  }
  // if (!req.body.composedMessage) {
  //   req.flash('error', 'Please enter a message.')
  //   res.redirect('/chats/new')
  //   return
  // }
  // console.log(mongoose.Types.ObjectId(req.user._id))
  // console.log(mongoose.Types.ObjectId(req.body.recipient))
  User.find({firstName: req.body.recipient}, function (err, findUser) {
    console.log('what is findUser', findUser)
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/chats/new')
      return
    }
    console.log('who is added to chatroom', mongoose.Types.ObjectId(findUser[0]._id))
    const Chatroomnew = new Chatroom({
      participants: [mongoose.Types.ObjectId(req.user._id), mongoose.Types.ObjectId(findUser._id)]
    })
    Chatroomnew.save(function (err, newChatroom) {
      if (err) {
        req.flash('error', err.toString())
        res.redirect('/chats/new')
        return
      }
      // console.log('am i creating new message with the new chatroom?')
      // const Messagenew = new Message({
      //   chatroomId: mongoose.Types.ObjectId(newChatroom._id),
      //   body: req.body.composedMessage,
      //   author: req.user._id,
      //   authorName: req.user.firstName
      // })
      // Messagenew.save(function (err, messages) {
      //   if (err) {
      //     req.flash('error', err.toString())
      //     res.redirect('/chats/new')
      //     return
      //   }
      req.flash('success', 'Conversation started!')
      // res.render('chatroom', {newChatroom: newChatroom, messages: messages})
      res.render('chatroom', {newChatroom: newChatroom, messages: []})
    })
  })
})

// sending/adding message
router.post('/:chatroomId', function (req, res, next) {
  console.log('am i posting a reply message?')
  console.log('am i posting a reply message to the correct chatroom?', req.params.chatroomId)
  const reply = new Message({
    chatroomId: req.params.chatroomId,
    body: req.body.composedMessage,
    author: req.user._id,
    authorName: req.user.firstName
  })
  reply.save(function (err, messages) {
    if (err) {
      req.flash('error', err.toString())
      return
    }
    res.render('chatroom', {messages: messages})
  })
})

// DELETE Route to Delete Conversation
router.delete('/:chatroomId', function (req, res, next) {
  console.log('to delete the chatroom')
  Message.find({ chatroomId: req.params.chatroomId }).remove().exec(function (err, messages) {
    console.log('I am deleting messages now!')
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/index')
      return
    }
    console.log('I am deleting chatroom now!')
    Chatroom.findOneAndRemove({
      $and: [
        { _id: req.params.chatroomId }, { participants: req.user._id }
      ]}, function (err) {
      if (err) {
        req.flash('error', err.toString())
        res.redirect('/chats')
        return
      }
      req.flash('success', 'You have deleted the chatroom and the messages.')
      res.redirect('/chats')
    })
  })
})
module.exports = router
