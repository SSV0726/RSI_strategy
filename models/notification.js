const Mongoose = require("mongoose");
const { Schema } = Mongoose;

// Contact Schema
const NotificationSchema = new Schema({
  message: {
    type: String,
    trim: true,
  },
  important:{
    type:Boolean,
    default:false
  },
  subject: String,
  managerEmail: String,
  managerID: String,
}, 
{ timestamps: true }
);

module.exports = Mongoose.model("Notification", NotificationSchema);
