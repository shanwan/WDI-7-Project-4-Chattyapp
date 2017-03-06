const mongoose = require('mongoose')

// create a schema for how the chat messages will be stored in mongoDB
const chatroomSchema = new mongoose.Schema({
  chatroomName: String,
  participants: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

const Chatroom = mongoose.model('Chatroom', chatroomSchema)

module.exports = Chatroom
