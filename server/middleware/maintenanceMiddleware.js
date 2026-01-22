const maintenanceMiddleware = (req, res, next) => {
  // Hardcoded constant acting as the "Global Constant" from legacy _DEFINE.php
  const WEBSITE_UNDER_MAINTENANCE = false;

  // Allow checking status without blocking
  if (req.path === "/api/maintenance-check") {
    return res.json({ maintenance: WEBSITE_UNDER_MAINTENANCE });
  }

  if (WEBSITE_UNDER_MAINTENANCE) {
    // Allow admin login or specific bypass if needed (Legacy didn't seem to allow bypass easily)
    // But for an API, we return 503
    return res.status(503).json({
      success: false,
      message: "The website is under maintenance. Please check back soon.",
      maintenance: true,
    });
  }
  next();
};

module.exports = maintenanceMiddleware;
