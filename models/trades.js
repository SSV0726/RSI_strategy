const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const tradeSchema = new mongoose.Schema(
  {
    instrument: String,
    product: {
      type: String,
      enum: ["MIS", "CNC", "NRML"],
    },
    t_type: {
      type: String,
      enum: ["BUY", "SELL"],
    },
    order_type: {
      type: String,
      enum: ["MARKET", "SL-M", "LIMIT"],
    },
    price: Number,
    trigger_price: Number,
    selectedSet:String,
    overallQty: Number,
    accounts: [
      {
        id: {
          type: ObjectId,
          ref: "Broker",
        },
        accountID: String,
        status: {
          type: String,
          default: "PENDING",
          enum: ["SUCCESS", "ERROR", "PENDING"],
        },
        qty: Number,
        userID: String,
        name: String,
        broker: String,
        multiplier: Number,
        orderID: Number,
        errMessage: String,
      },
    ],
    managerID: String,
    managerEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);
