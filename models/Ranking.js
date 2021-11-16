const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const rankingSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    rank: Number,
    preferredRank: {
      type: Number,
      default: null,
    },
    preferred: {
      type: Boolean,
      default: false,
    },
    uid: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ranking", rankingSchema);
