const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const maintenanceMiddleware = require("./middleware/maintenanceMiddleware");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local Vite/React dev server
      "https://flipcart-fawn.vercel.app", // Replace with your actual Frontend URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
  }),
);
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
