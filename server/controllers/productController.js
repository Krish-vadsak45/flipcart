const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const crypto = require("crypto");

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");
const SETTINGS_FILE = path.join(__dirname, "../data/settings.json");

const md5 = (str) => crypto.createHash("md5").update(String(str)).digest("hex");

// Helper to read and write JSON data
const readJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      // Initialize with empty array if it's the products file
      if (filePath.endsWith("products.json")) {
        fs.writeFileSync(filePath, "[]", "utf8");
        return [];
      }
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return null;
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
};

const getPublicSettings = async (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  if (settings) {
    res.json({ success: true, data: settings });
  } else {
    res.json({ success: false, message: "Settings not found" });
  }
};

const getProducts = async (req, res) => {
  try {
    let products = readJSON(PRODUCTS_FILE) || [];
    const { start = 0, length = 10, search = "" } = req.query;
    const searchValue = search.toLowerCase();

    // Filter
    if (searchValue) {
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchValue) ||
          p.verients?.some(
            (v) =>
              v.color?.toLowerCase().includes(searchValue) ||
              v.size?.toLowerCase().includes(searchValue) ||
              v.storage?.toLowerCase().includes(searchValue),
          ),
      );
    }

    const totalCount = products.length;

    // Sort
    products.sort((a, b) => {
      const orderA = parseInt(a.disp_order) || 9999999;
      const orderB = parseInt(b.disp_order) || 9999999;
      if (orderA !== orderB) return orderA - orderB;
      return b.id - a.id;
    });

    // Slice
    const data = products
      .slice(parseInt(start), parseInt(start) + parseInt(length))
      .map((p) => ({
        ...p,
        md5_id: md5(p.id),
      }));

    console.log(
      `Fetched products with search="${search}", start=${start}, length=${length}. Total after filter: ${totalCount}`,
    );

    res.json({
      success: 1,
      status: 1,
      message: "success.",
      recordsTotal: totalCount,
      recordsFiltered: totalCount,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = readJSON(PRODUCTS_FILE) || [];

    // Check both numerical ID and MD5 ID to support both Admin (numerical) and Client (MD5)
    const product = products.find(
      (p) => String(p.id) === String(id) || md5(p.id) === id,
    );

    if (!product) {
      return res.status(404).json({ success: 0, message: "Product not found" });
    }

    // Add aggregate fields like in SQL
    const sizes = [
      ...new Set(product.verients?.map((v) => v.size).filter(Boolean)),
    ].join(",");
    const storages = [
      ...new Set(product.verients?.map((v) => v.storage).filter(Boolean)),
    ].join(",");
    const colors = [
      ...new Set(product.verients?.map((v) => v.color).filter(Boolean)),
    ].map((c) => ({ color_name: c }));

    console.log(`Fetched product with ID=${id}`);

    res.json({
      success: 1,
      status: 1,
      message: "success.",
      data: { ...product, sizes, storages, colors, md5_id: md5(product.id) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const addProduct = async (req, res) => {
  try {
    const products = readJSON(PRODUCTS_FILE) || [];
    const newProduct = {
      id: Date.now(),
      ...req.body,
      verients: req.body.varient || [],
    };
    delete newProduct.varient;
    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: 1, message: "Product added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = readJSON(PRODUCTS_FILE) || [];
    const index = products.findIndex((p) => p.id == id);
    if (index === -1)
      return res.status(404).json({ success: 0, message: "Product not found" });

    products[index] = {
      ...products[index],
      ...req.body,
      verients: req.body.varient || products[index].verients || [],
    };
    delete products[index].varient;
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: 1, message: "Product updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const updateProductOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { disp_order } = req.body;
    const products = readJSON(PRODUCTS_FILE) || [];
    const index = products.findIndex((p) => p.id == id);
    if (index !== -1) {
      products[index].disp_order = disp_order;
      writeJSON(PRODUCTS_FILE, products);
    }
    res.json({ success: 1, message: "Order updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    let products = readJSON(PRODUCTS_FILE) || [];
    products = products.filter((p) => p.id != id);
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: 1, message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    let products = readJSON(PRODUCTS_FILE) || [];
    products = products.filter((p) => p.id != id);
    writeJSON(PRODUCTS_FILE, products);
    res.json({ success: 1, message: "Record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const deleteAllRecords = async (req, res) => {
  try {
    writeJSON(PRODUCTS_FILE, []);
    res.json({ success: 1, message: "All records deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

const uploadCsv = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: 0, message: "No CSV file uploaded" });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv({ headers: false }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const dataRows = results.slice(1);
        let products = readJSON(PRODUCTS_FILE) || [];
        let lastItem = {};

        for (const row of dataRows) {
          let name = row["0"] ? row["0"].trim() : "";
          let color = row["1"] ? row["1"].trim() : "";
          let size = row["2"] ? row["2"].trim() : "";
          let storage = row["3"] ? row["3"].trim() : "";
          let selling_price = row["4"] ? row["4"].trim() : "";
          let mrp = row["5"] ? row["5"].trim() : "";
          let features = row["6"] ? row["6"].trim() : "";
          let img1 = row["7"] ? row["7"].trim() : "";
          let img2 = row["8"] ? row["8"].trim() : "";
          let img3 = row["9"] ? row["9"].trim() : "";
          let img4 = row["10"] ? row["10"].trim() : "";
          let img5 = row["11"] ? row["11"].trim() : "";
          let disp_order = row["12"] ? row["12"].trim() : "99999";

          if (Object.keys(lastItem).length > 0) {
            name = name === "" || name === "-" ? lastItem.name : name;
            color = color === "" || color === "-" ? lastItem.color : color;
            size = size === "" || size === "-" ? lastItem.size : size;
            storage =
              storage === "" || storage === "-" ? lastItem.storage : storage;
            selling_price =
              selling_price === "" || selling_price === "-"
                ? lastItem.selling_price
                : selling_price;
            mrp = mrp === "" || mrp === "-" ? lastItem.mrp : mrp;
            features =
              features === "" || features === "-"
                ? lastItem.features
                : features;
            img1 = img1 === "" || img1 === "-" ? lastItem.img1 : img1;
            img2 = img2 === "" || img2 === "-" ? lastItem.img2 : img2;
            img3 = img3 === "" || img3 === "-" ? lastItem.img3 : img3;
            img4 = img4 === "" || img4 === "-" ? lastItem.img4 : img4;
            img5 = img5 === "" || img5 === "-" ? lastItem.img5 : img5;
          }

          lastItem = {
            name,
            color,
            size,
            storage,
            selling_price,
            mrp,
            features,
            img1,
            img2,
            img3,
            img4,
            img5,
          };

          let product = products.find((p) => p.name === name);
          if (!product) {
            product = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              name,
              disp_order,
              verients: [],
            };
            products.push(product);
          }

          product.verients.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name,
            color,
            size,
            storage,
            selling_price,
            mrp,
            features,
            img1,
            img2,
            img3,
            img4,
            img5,
          });

          // Legacy behavior: product fields also update with variant fields
          product.color = color;
          product.size = size;
          product.storage = storage;
          product.selling_price = selling_price;
          product.mrp = mrp;
          product.features = features;
          product.img1 = img1;
          product.img2 = img2;
          product.img3 = img3;
          product.img4 = img4;
          product.img5 = img5;
        }

        writeJSON(PRODUCTS_FILE, products);
        res.json({ success: 1, message: "CSV uploaded successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: 0, message: "Error processing CSV" });
      }
    });
};

module.exports = {
  getPublicSettings,
  updateProduct,
  deleteById,
  getProducts,
  getProductById,
  addProduct,
  deleteRecord,
  deleteAllRecords,
  updateProductOrder,
  uploadCsv,
};
