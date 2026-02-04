const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const maintenanceMiddleware = require("./middleware/maintenanceMiddleware");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors({
  origin: "https://flipcart-fawn.vercel.app", // EXACT frontend URL
  credentials: true
}));
app.use(maintenanceMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder for uploaded files (to serve images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Flipcart API is running...");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");

app.use("/api/auth", authRoutes);
// Public/Storefront Product Routes (and some shared logic)
app.use("/api/products", productRoutes);
// Admin Specific Routes (Settings, etc.)
app.use("/api", adminRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
