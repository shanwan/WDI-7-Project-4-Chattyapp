const express = require('express')
const mongoose = require('mongoose')
const Chatroom = require('../models/chatroom')
const Message = require('../models/message')
const router = express.Router()

// View messages to and from authenticated user
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
    // Set up empty array to hold conversations + most recent message
    // let fullChatrooms = []
    // chatrooms.forEach(function (chatroom) {
    //   Message.find({ 'chatroomId': chatroom._id })
    //   .sort('-createdAt')
    //   .limit(1)
    //   .populate({
    //     path: 'author',
    //     select: 'profile.firstName profile.lastName'
    //   })
    //   .exec(function (err, message) {
    //     if (err) {
    //       req.flash('error', err.toString())
    //       res.redirect('/index')
    //       return
    //       // next(err)
    //     }
    //     fullChatrooms.push(message)
    //     if (fullChatrooms.length === chatrooms.length) {
    //       return res.status(200).json({chatrooms: fullChatrooms})
    //     }
    res.render('listChat', {chatrooms: chatrooms})
  })
})
// })
// })

// brings up a new form
router.get('/new', function (req, res, next) {
  console.log('get new and render')
  res.render('new')
})


// get all messages in one chatroom - Retrieve single conversation
router.get('/:chatroomId', function (req, res, next) {
  console.log('get by chatroomId before', req.params)
  Message.find({ chatroomId: req.params.chatroomId })
  .select('createdAt body author')
  .sort('-createdAt')
  .populate({
    path: 'author',
    select: 'profile.firstName profile.lastName'
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
    // res.status(200).json({conversation: messages})
  })
})

// create new conversation
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
  console.log(mongoose.Types.ObjectId(req.user._id))
  console.log(mongoose.Types.ObjectId(req.body.recipient))
  const Chatroomnew = new Chatroom({
    participants: [mongoose.Types.ObjectId(req.user._id), mongoose.Types.ObjectId(req.body.recipient)]
  })
  Chatroomnew.save(function (err, newChatroom) {
    if (err) {
      req.flash('error', err.toString())
      res.redirect('/chats/new')
      return
      // next(err)
    }
    const Messagenew = new Message({
      chatroomId: newChatroom._id,
      body: req.body.composedMessage,
      author: req.user._id
    })
    Messagenew.save(function (err, message) {
      if (err) {
        req.flash('error', err.toString())
        res.redirect('/chats/new')
        return
        // next(err)
      }
      req.flash('success', 'Conversation started!')
      res.render('chatroom', {newChatroom: newChatroom, message: message})
      return next()
    })
  })
})

// sending/adding message
router.post('/:chatroomId', function (req, res, next) {
  const reply = new Message({
    chatroomId: req.params.chatroomId,
    body: req.body.composedMessage,
    author: req.user._id
  })
  reply.save(function (err, sentReply) {
    if (err) {
      res.send({ error: err })
      return next(err)
    }
    res.status(200).json({ message: 'Reply successfully sent!' })
    return (next)
  })
})

// // DELETE Route to Delete Conversation
// exports.deleteConversation = function(req, res, next) {
//   Conversation.findOneAndRemove({
//     $and : [
//             { '_id': req.params.conversationId }, { 'participants': req.user._id }
//            ]}, function(err) {
//         if (err) {
//           res.send({ error: err });
//           return next(err);
//         }
//
//         res.status(200).json({ message: 'Conversation removed!' });
//         return next();
//   });
// }

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
