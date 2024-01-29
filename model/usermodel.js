const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      requried: true,
      trim: true,
    },
    phonenumber: {
      type: Number,
      required: true,
      trim: true,
    },
    isUnder18: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("users", userSchema);
