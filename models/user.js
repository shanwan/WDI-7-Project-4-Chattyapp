const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/

// create a schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    match: emailRegex
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: { type: String },
    lastName: { type: String }
  },
  role: { // what is this??
    type: String,
    enum: ['Member', 'Client', 'Owner', 'Admin'],
    default: 'Member'
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},
  {
    timestamps: true
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

UserSchema.methods.sayHello = function () {
  return 'Hi ' + this.name + ', Welcome to Chatertain'
}

const User = mongoose.model('User', UserSchema)

module.exports = User
