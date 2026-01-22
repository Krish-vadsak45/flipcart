const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const [users] = await db.query(
        "SELECT id, username, role_id FROM tbl_users WHERE id = ?",
        [decoded.id],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      req.user = users[0];

      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: 0, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: 0, message: "Not authorized, no token" });
  }
};

module.exports = { protect };
