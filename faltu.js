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