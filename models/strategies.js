const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const strategySchema = new mongoose.Schema(
  {
    nameOfStrategy: String,
    instrument1: String,
    condition1: {
      type: String,
      default: "greaterthan",
      enum: ["greaterthan", "lessthan", "equalto"],
    },
    price1: String,
    overallCondition1: {
      type: String,
      default: "and",
      enum: ["and", "or"],
    },
    instrument2: String,
    condition2: {
      type: String,
      default: "greaterthan",
      enum: ["greaterthan", "lessthan", "equalto"],
    },
    price2: String,
    overallCondition2: {
      type: String,
      default: "and",
      enum: ["and", "or"],
    },
    condition3: {
      type: String,
      default: "greaterthan",
      enum: ["greaterthan", "lessthan", "equalto"],
    },
    time: String,
    managerID: String,
    managerEmail: String,
    saveStrategy: Boolean,
    overallQty: Number,
    executed: { type: Boolean, default: false },
    executionTime: Date,
    selectedSet:String,
    trades: [
      {
        instrument: String,
        product: {
          type: String,
          default: "MIS",
          enum: ["MIS", "CNC", "NRML"],
        },
        t_type: {
          type: String,
          default: "BUY",
          enum: ["BUY", "SELL"],
        },
        entry_price: Number,
      },
    ],
    accounts: [
      {
        id: {
          type: ObjectId,
          ref: "Broker",
        },
        accountID: String,
        qty: Number,
        userID: String,
        multiplier: Number,
        name: String,
        broker: String,
        trades: [
          {
            instrument: String,
            product: {
              type: String,
              default: "MIS",
              enum: ["MIS", "CNC", "NRML"],
            },
            t_type: {
              type: String,
              default: "BUY",
              enum: ["BUY", "SELL"],
            },
            entry_price: Number,
            orderID: String,
            status: {
              type: String,
              default: "PENDING",
              enum: ["SUCCESS", "ERROR", "PENDING"],
            },
            errMessage: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Strategy", strategySchema);
