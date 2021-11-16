const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const managerSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: "individual",
      enum: ["individual", "manager"],
    },
    uid: String,
    mobile: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Manager", managerSchema);
