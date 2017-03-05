const mongoose = require('mongoose')

// create a schema
const msgSchema = new mongoose.Schema({
  content: String
})

const chatSchema = new mongoose.Schema({
  chatroom: String,
  messages: [msgSchema]
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
