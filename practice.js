const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cookies = require("cookie-parser");
const generatetoken = require("./tokens/generatetoken");
const verifytoken = require("./tokens/verifytokens");
const jwt = require("jsonwebtoken");

app.use(cookies());
const { connectDatabase } = require("./connection/connect");
const USERS_MODEL = require("./model/usermodel");
const { encrytPassword, verifyPassword } = require("./functions/encryption");
const { sendLoginOtp, verifyOtp } = require("./functions/otp");

app.post("/signup", async (req, res) => {
  try {
    const newuser = {
      email: req.body.email.toLowerCase(),
      username: req.body.username,

      userpassword: await encrytPassword(req.body.userpassword),
      phonenumber: req.body.phonenumber,
    };
    let checkemail = await USERS_MODEL.findOne({
      email: req.body.email.toLowerCase(),
    });
    // console.log(checkemail);
    if (!checkemail) {
      const clients = new USERS_MODEL(newuser);
      await clients.save();
      return res.json({ success: true, message: "Data Saved successfully" });
    } else {
      return res.json({ success: false, message: "User already" });
    }
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    // console.log(req.body);

    let inputpassword = req.body.userpassword;
    const checkuser = await USERS_MODEL.findOne({
      email: req.body.email,
    });

    // if (check_password && check_name)
    if (!checkuser) {
      return res.json({ success: fasle, message: "user not exist" });
    }
    let originalpassword = checkuser.userpassword;
    console.log(inputpassword);
    console.log(originalpassword);
    if (await verifyPassword(inputpassword, originalpassword)) {
      sendLoginOtp(`+91${checkuser.phonenumber}`);
      // const u_id = checkuser.userid;
      // const token = generatetoken(u_id);
      // console.log(token);
      // res.cookie("web_tk", token);
      return res.json({
        success: true,
        message: "cookie generated successfully",
      });
    } else {
      return res.json({ success: false, message: "Incorrect Password" });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

const middleware = (req, res, next) => {
  if (verifytoken(req.cookies.web_tk)) {
    const userinfo = verifytoken(req.cookies.web_tk);
    req.userid = userinfo.id;
    console.log(userinfo);
    next();
  } else {
    return res.status(400).json({ success: false, error: "UNUTHORIZED" });
  }
};
// app.get("/savedposts", checkIfUserLoggedIn, (req, res) => {
//   try {
//     let loggedId = req.userid;
//     let notifications = {
//       "65aaaa10b10198488ee3434": "Notificaiton 1",
//       "65aaaa10b10198488e4546": "Notification 22",
//       "65aaaa10b10198488ee3e12f": "Notification of logged in user",
//       "65abff80c224b1a6dbdcf629": "Notification of new user",
//     };
//     return res.json({ success: true, message: notifications[loggedId] });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });
app.get("/getdata", middleware, (req, res) => {
  try {
    return res.json({ success: true, message: "fully authorized" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

app.post("/mfa", async (req, res) => {
  try {
    let email = req.body.email;
    let inputpassword = req.body.userpassword;
    const checkUser = await USERS_MODEL.findOne({ email: email });
    if (!checkUser) {
      return res
        .status(400)
        .json({ success: false, error: "User not found, please signup first" });
    }
    let originalpassword = checkUser.userpassword;

    if (
      (await verifyPassword(inputpassword, originalpassword)) &&
      (await verifyOtp(`+91${checkUser.phonenumber}`, "026698"))
    ) {
      const token = generatetoken(checkUser._id);
      res.cookie("auth_tk", token);
      return res.json({ success: true, message: "Logged in success" });
    } else {
      return res.status(400).json({ success: false, error: "Wrong Otp" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    let email = req.body.email;
    let inputpassword = req.body.userpassword;
    const checkUser = await USERS_MODEL.findOne({ email: email });
    if (!checkUser) {
      return res
        .status(400)
        .json({ success: false, error: "User not found, please signup first" });
    }
    let originalpassword = checkUser.userpassword;

    if (await verifyPassword(inputpassword, originalpassword)) {
      sendLoginOtp(`+91${checkUser.phonenumber}`);

      // const token = generatetoken(checkUser._id);
      // res.cookie("auth_tk", token);
      return res.json({ success: true, message: "please enter otp" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Incorrect password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
});
connectDatabase();
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
