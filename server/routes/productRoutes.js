const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.post("/", protect, productController.addProduct);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteById);
router.post("/add", protect, productController.addProduct);
router.post("/delete", protect, productController.deleteRecord);
router.post("/delete-all", protect, productController.deleteAllRecords);
router.post("/update-order", protect, productController.updateProductOrder);
router.post(
  "/upload-csv",
  protect,
  upload.single("file"),
  productController.uploadCsv,
);

// Image Upload Helper Route
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  // Return the path so frontend can use it in addProduct
  const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ success: 1, imageUrl: fullUrl, filename: req.file.filename });
});

module.exports = router;
