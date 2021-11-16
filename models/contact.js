const Mongoose = require("mongoose");
const { Schema } = Mongoose;

// Contact Schema
const ContactSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
  },
});

module.exports = Mongoose.model("Contact", ContactSchema);
