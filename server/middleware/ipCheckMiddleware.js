const db = require("../config/db");

const ipCheckMiddleware = async (req, res, next) => {
  try {
    // 1. Fetch allowed_ip from settings
    const [settings] = await db.query(
      "SELECT allowed_ip FROM tbl_settings WHERE id = 1",
    );
    if (!settings || settings.length === 0) {
      return next(); // No settings, proceed (or should we fail open? Legacy implies if setting exists check it)
    }

    const allowedIpsString = settings[0].allowed_ip;

    // 2. If empty, allow all
    if (!allowedIpsString || allowedIpsString.trim() === "") {
      return next();
    }

    // 3. Get client IP
    let clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    // Normalize IP (handle IPv6 mapping to IPv4 like ::ffff:127.0.0.1)
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.substr(7);
    }
    // Handle localhost IPv6
    if (clientIp === "::1") {
      clientIp = "127.0.0.1";
    }

    // 4. Check if client IP is in the allowed list
    const allowedList = allowedIpsString
      .split(",")
      .map((ip) => ip.trim())
      .filter((ip) => ip !== "");

    // If list is not empty and Client IP is not in it, deny
    if (allowedList.length > 0 && !allowedList.includes(clientIp)) {
      console.warn(`Access Denied for IP: ${clientIp}`);
      return res.status(403).json({
        success: false,
        message: "Access Denied: Your IP is not allowed.",
      });
    }

    next();
  } catch (error) {
    console.error("IP Check Error:", error);
    // In case of DB error, maybe allow to avoid lockout? Or deny safe?
    // Failing safe usually means deny, but failing open keeps site up.
    // For now, proceed to avoid breaking admin due to unrelated DB glitch.
    next();
  }
};

module.exports = ipCheckMiddleware;
