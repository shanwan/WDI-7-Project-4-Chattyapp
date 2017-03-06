const express = require('express')
const Chatroom = require('../models/chatroom')
const Message = require('../models/message')
const router = express.Router()

router.get('/', function (req, res, next) {
  // Only return one message from each conversation to display as snippet
  Chatroom.find({ participants: req.user._id })
  .select('_id')
  .exec(function (err, chatrooms) {
    if (err) {
      res.send({error: err})
      return next(err)
    }
    // Set up empty array to hold conversations + most recent message
    let fullChatrooms = []
    chatrooms.forEach(function (chatroom) {
      Message.find({ 'chatroomId': chatroom._id })
      .sort('-createdAt')
      .limit(1)
      .populate({
        path: 'author',
        select: 'profile.firstName profile.lastName'
      })
      .exec(function (err, message) {
        if (err) {
          res.send({error: err})
          return next(err)
        }
        fullChatrooms.push(message)
        if (fullChatrooms.length === chatrooms.length) {
          return res.status(200).json({chatrooms: fullChatrooms})
        }
      })
    })
  })
})

// get all messages in one chatroom
router.get('/:idx', function (req, res, next) {
  Message.find({ chatroomId: req.params.chatroomId })
  .select('createdAt body author')
  .sort('-createdAt')
  .populate({
    path: 'author',
    select: 'profile.firstName profile.lastName'
  })
  .exec(function (err, messages) {
    if (err) {
      res.send({ error: err })
      return next(err)
    }
    res.status(200).json({conversation: messages})
  })
})

// create new conversation
router.post('/', function (req, res, next) {
  if (!req.params.recipient) {
    res.status(422).send({ error: 'Please choose a valid recipient for your message.' })
    return next()
  }
  if (!req.body.composedMessage) {
    res.status(422).send({ error: 'Please enter a message.' })
    return next()
  }
  const Chatroom = new Chatroom({
    participants: [req.user._id, req.params.recipient]
  })
  Chatroom.save(function (err, newChatroom) {
    if (err) {
      res.send({ error: err })
      return next(err)
    }
    const Message = new Message({
      chatroomId: newChatroom._id,
      body: req.body.composedMessage,
      author: req.user._id
    })
    Message.save(function (err, newMessage) {
      if (err) {
        res.send({ error: err })
        return next(err)
      }
      res.status(200).json({message: 'Conversation started!'})
      return next()
    })
  })
})

// sending/adding message
router.post('/:idx', function (req, res, next) {
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
