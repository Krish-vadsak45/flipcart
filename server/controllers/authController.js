const db = require("../config/db");
const sendEmail = require("../utils/emailHelper");
const jwt = require("jsonwebtoken");
const logAction = require("../utils/logger");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: 0, message: "Email and Password are required." });
  }

  try {
    // Check if user exists
    const [users] = await db.query(
      "SELECT * FROM tbl_users WHERE username = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: 0,
        message: "Your account is Inactive or this Username does not exist.",
      });
    }

    const user = users[0];

    // Check Password (Plain text comparison as per original PHP code)
    if (user.password !== password) {
      return res.status(401).json({ success: 0, message: "Invalid password." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const dateNow = new Date();

    // Update user with OTP and last login time
    await db.query(
      "UPDATE tbl_users SET otp = ?, last_logged_in = ? WHERE id = ?",
      [otp, dateNow, user.id],
    );

    // Send OTP Email
    const emailBody = `Your OTP for login is <b>${otp}</b>`;
    const mailResp = await sendEmail(email, "Login OTP", emailBody);

    // Remove sensitive data
    delete user.password;
    delete user.otp;

    res.json({
      success: 1,
      message: "User logged in successfully. OTP sent to email.",
      data: user,
      mail_resp: mailResp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: 0, message: "Email and OTP are required." });
  }

  try {
    const [users] = await db.query(
      "SELECT * FROM tbl_users WHERE username = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: 0, message: "User not found." });
    }

    const user = users[0];

    // Logic from PHP: if ($userotp == $otp)
    if (String(user.otp) === String(otp)) {
      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );

      // Log Login
      req.user = user;
      logAction(req, "Login", "login_user");

      delete user.password;
      delete user.otp;

      res.json({
        success: 1,
        message: "OTP Verified Successfully.",
        token: token,
        data: user,
      });
    } else {
      res.status(400).json({ success: 0, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }
    res.json({ success: 1, data: user });
  } catch (error) {
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

module.exports = {
  login,
  verifyOtp,
  getMe,
};
