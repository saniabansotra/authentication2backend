const express = require("express");
const app = express();
app.use(express.json());
const USER_MODEL = require("./model/usermodel");
const { connectDatabase } = require("./connection/connect");

const cookies = require("cookie-parser");
app.use(cookies());
const verifyToken = require("./tokens/verifyToken");
const generateToken = require("./tokens/generateToken");
const { encrytPassword, verifyPassword } = require("./functions/encryption");
const { sendLoginOtp, verifyOtp } = require("./functions/otp");

app.post("/signup", async (req, res) => {
  try {
    const user = new USER_MODEL({
      name: req.body.name,
      email: req.body.name,
      password: await encrytPassword(req.body.password),
      date: req.body.date,
      phonenumber: req.body.phonenumber,
      isUnder18: req.body.isUnder18,
    });
    const checkuser = await USER_MODEL.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (!checkuser) {
      await user.save();
      return res.json({ success: true, message: "Signed Up success" });
    }

    return res.json({ success: false, error: "user already registered" });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});
app.post("/login", async (req, res) => {
  try {
    let email = req.body.email;
    let inputPassword = req.body.password;
    const checkUser = await USER_MODEL.findOne({ email: email });
    if (!checkUser) {
      return res.json({
        success: false,
        error: "User not found, please signup first",
      });
    }
    let originalPassword = checkUser.password;
    if (await verifyPassword(inputPassword, originalPassword)) {
      sendLoginOtp(`+91${checkUser.phonenumber}`);
      return res.json({ success: true, message: "Please enter OTP to login" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect Password" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});
const checkIfUserLoggedIn = (req, res, next) => {
  if (verifyToken(req.cookies.auth_tk)) {
    const userinfo = verifyToken(req.cookies.auth_tk);
    req.userid = userinfo.id;
    next();
  } else {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }
};
app.post("/mfaverify", async (req, res) => {
  try {
    let email = req.body.email;
    let inputPassword = req.body.password;
    const checkUser = await USER_MODEL.findOne({ email: email });
    if (!checkUser) {
      return res.json({
        success: false,
        error: "User not found, please signup first",
      });
    }
    let originalPassword = checkUser.password;
    if (
      (await verifyPassword(inputPassword, originalPassword)) &&
      (await verifyOtp(`+91${checkUser.phonenumber}`, code))
    ) {
      const token = generateToken(checkUser._id);
      res.cookie("auth_tk", token);
      return res.json({ success: true, message: "Logged in success" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect Credentials" });
    }
  } catch (error) {
    return res.json({ success: true, message: error.message });
  }
});
app.get("/currentuser", checkIfUserLoggedIn, async (req, res) => {
  try {
    const userid = req.userid;
    const userdetails = await USER_MODEL.findOne(
      { _id: userid },
      { email: 1, name: 1, dob: 1, isUnder18, createdAt: 1 }
    );
    if (userdetails) {
      return res.json({ success: true, data: userdetails });
    } else {
      return res.json({ success: false, error: "User Not found" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

connectDatabase();
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
