const mongoose = require('mongoose')

// create a schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, required: true, unique: true }
})

userSchema.methods.sayHello = function () {
  return 'Hi ' + this.name + ', Welcome to Chatertain'
}

const User = mongoose.model('User', userSchema)

module.exports = User
