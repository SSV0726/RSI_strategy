const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

var AccountSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  broker: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  pin: String,
  pan: {
    type: String,
    required: true,
  },
  auth_type: String,
  totp_secret: String,
  apiKey: String,
  secret: String,
  accessToken: String, // not to be shoqn
  enctoken: String, //
  autoLogin: Boolean,
  algoTrading: Boolean,
  DOB: Date,
  email: String,
  mobile: Number,
  balance: {
    //
    type: Number,
    required: true,
    default: 0,
  },
  managerEmail: String,
  managerID: String,
}, 
{ timestamps: true }
);

module.exports = mongoose.model("Account", AccountSchema);
