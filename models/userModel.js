const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const validate = require('validate')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user must have name"],
  },
  email: {
    type: String,
    required: [true, "user must have email address"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "user must enter the password"],
    select: false,
  },
  followers: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  followings: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  blockList: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  favPosts: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
    },
  ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (requestPass, userPass) {
  return await bcrypt.compare(requestPass, userPass);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
