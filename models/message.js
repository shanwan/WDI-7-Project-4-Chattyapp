const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true // where are the messages?
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
  {
    timestamps: true
  } // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
)

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
