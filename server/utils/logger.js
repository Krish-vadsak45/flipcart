const db = require("../config/db");

const logAction = async (req, action, operation) => {
  try {
    const userId = req.user ? req.user.id : 0;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    await db.query(
      "INSERT INTO tbl_audit_logs (user_id, action, operation, `from`, status, date_added, date_modified, is_deleted, ip_address) VALUES (?, ?, ?, 'panel', 1, NOW(), NOW(), 1, ?)",
      [userId, action, operation, ip],
    );
  } catch (e) {
    console.error("Logging failed", e);
  }
};

module.exports = logAction;
