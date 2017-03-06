const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/

// create a schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: [3, 'Name must be between 3 and 99 characters'],
    maxlength: [99, 'Name must be between 3 and 99 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: emailRegex
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be between 8 and 99 characters']
  }
})

UserSchema.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  var hash = bcryptjs.hashSync(user.password, 10)
  user.password = hash
  next()
})

UserSchema.methods.validPassword = function (password) {
  return bcryptjs.compareSync(password, this.password)
}

UserSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.password
    return ret
  }
}

userSchema.methods.sayHello = function () {
  return 'Hi ' + this.name + ', Welcome to Chatertain'
}

const User = mongoose.model('User', userSchema)

module.exports = User
