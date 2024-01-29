const mongoose = require("mongoose");
const connectDatabase = () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017").then(() => {
      console.log("Database connected");
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { connectDatabase };
