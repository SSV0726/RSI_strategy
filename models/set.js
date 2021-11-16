const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const setSchema = new mongoose.Schema(
  {
    nameOfSet: String,
    accounts: [
      {
        multiplier: {
          type: Number,
          default: 0,
        },
        accountID: String,
        userID: String,
        name: String,
        broker: String,
      },
    ],
    managerID: String,
    managerEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Set", setSchema);
