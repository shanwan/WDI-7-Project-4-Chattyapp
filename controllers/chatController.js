const express = require('express')
const mongoose = require('mongoose')
const Chatroom = require('../models/chatroom')
const User = require('../models/user')
const Message = require('../models/message')
const router = express.Router()

mongoose.Promise = global.Promise

// View list of chatrooms
router.get('/', function (req, res, next) {
  // Only return one message from each conversation to display as snippet
  console.log('User_id', req.user._id)
  Chatroom.find({ participants: req.user._id })
  .select('_id')
  .exec(function (err, chatrooms) {
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/index')
      return
      // next(err)
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
      // next(err)
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
    // next()
  }
  if (!req.body.composedMessage) {
    req.flash('error', 'Please enter a message.')
    res.redirect('/chats/new')
    return
    // next()
  }
  User.findOne({ firstName: req.body.recipient }, '_id', function (err, selectedUser) {
    console.log('who is the selectedUser?', selectedUser)
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/chats/new')
      return
    }
    // console.log(mongoose.Types.ObjectId(req.user._id))
    // console.log(mongoose.Types.ObjectId(req.body.recipient))
    const Chatroomnew = new Chatroom({
      participants: [mongoose.Types.ObjectId(req.user._id), mongoose.Types.ObjectId(selectedUser._id)]
    })
    Chatroomnew.save(function (err, newChatroom) {
      if (err) {
        req.flash('error', err.toString())
        res.redirect('/chats/new')
        return
        // next(err)
      }
      console.log('am i creating new message with the new chatroom?')
      const Messagenew = new Message({
        chatroomId: mongoose.Types.ObjectId(newChatroom._id),
        body: req.body.composedMessage,
        author: req.user._id,
        authorName: req.user.firstName
      })
      Messagenew.save(function (err, messages) {
        if (err) {
          req.flash('error', err.toString())
          res.redirect('/chats/new')
          return
          // next(err)
        }
        req.flash('success', 'Conversation started!')
        res.render('chatroom', {newChatroom: newChatroom, messages: messages})
        // return next()
      })
    })
  })
})

// sending/adding message
router.post('/:chatroomId', function (req, res, next) {
  console.log('am i posting a reply message?')
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
      // next(err)
    }
    // res.status(200).json({ message: 'Reply successfully sent!' })
    res.render('chatroom', {messages: messages})
    // return (next)
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
      // next(err)
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
          // next(err)
        }
        req.flash('success', 'You have deleted the chatroom and the messages.')
        res.redirect('/chats')
      })
    })
  })

  // // PUT Route to Update Message
  // exports.updateMessage = function(req, res, next) {
  //   Conversation.find({
  //     $and : [
  //             { '_id': req.params.messageId }, { 'author': req.user._id }
  //           ]}, function(err, message) {
  //         if (err) {
  //           res.send({ error: err});
  //           return next(err);
  //         }
  //
  //         message.body = req.body.composedMessage;
  //
  //         message.save(function (err, updatedMessage) {
  //           if (err) {
  //             res.send({ error: err });
  //             return next(err);
  //           }
  //
  //           res.status(200).json({ message: 'Message updated!' });
  //           return next();
  //         });
  //   });
  // }

  module.exports = router
