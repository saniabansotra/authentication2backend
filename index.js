const express = require("express");
const app = express();
app.use(express.json());
const USER_MODEL = require("./model/usermodel");
const { connectDatabase } = require("./connection/connect");

app.post("/signup", async (req, res) => {
  try {
    const checkuser = await USER_MODEL.findOne({
      email: req.body.email.toLowerCase,
    });
    if (checkuser) {
      return res.json({ success: false, error: "user already registered" });
    }
    const user = {
      name: req.body.name,
      email: req.body.name,
      password: req.body.password,
      date: req.body.date,
      phonenumber: req.body.phonenumber,
      isUnder18: req.body.isUnder18,
    };
    await user.save();
    return res.json({ success: true, message: "Signed Up success" });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

connectDatabase();
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
