const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true
  },
  body: {
    type: String,
    required: true // composedbody
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String
  }
},
  {
    timestamps: true
  } // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
)

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
