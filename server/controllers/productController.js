const db = require("../config/db");

// Get Products with Pagination and Search
const getProducts = async (req, res) => {
  try {
    const { start = 0, length = 10, search = "" } = req.query;
    const searchValue = search || "";
    const offset = parseInt(start);
    const limit = parseInt(length);

    let whereClause = "1=1";
    let queryParams = [];

    // Search Logic (Same as before)
    if (searchValue) {
      whereClause += ` AND (p.name LIKE ? OR pv.color LIKE ? OR pv.size LIKE ? OR pv.storage LIKE ? OR pv.selling_price LIKE ?)`;
      const likeSearch = `%${searchValue}%`;
      queryParams = [
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
        likeSearch,
      ];
    }

    // Combined Count Logic (Using INNER JOIN to match legacy behavior)
    // Only counts products that actually have variants
    const [filteredRows] = await db.query(
      `
      SELECT COUNT(DISTINCT p.id) as cnt 
      FROM tbl_product p 
      INNER JOIN tbl_product_verient pv ON pv.product_id = p.id 
      WHERE ${whereClause}`,
      queryParams,
    );
    const filteredCount = filteredRows[0].cnt;

    // Total Count (Of valid products only)
    const [totalRows] = await db.query(
      `SELECT COUNT(DISTINCT p.id) as cnt 
       FROM tbl_product p 
       INNER JOIN tbl_product_verient pv ON pv.product_id = p.id`,
    );
    const totalCount = totalRows[0].cnt;

    // Custom Sorting Logic (Matches PHP: put defined disp_order first, push 0/null to end)
    const orderBy = `
      ORDER BY 
      CASE 
        WHEN (p.disp_order IS NULL OR p.disp_order = 0) THEN 9999999 
        ELSE p.disp_order 
      END ASC, 
      p.id DESC
    `;

    // Fetch Data
    // Changed LEFT JOIN to INNER JOIN to hide products with no variants
    const query = `
      SELECT DISTINCT p.*, MD5(p.id) as md5_id 
      FROM tbl_product p 
      INNER JOIN tbl_product_verient pv ON pv.product_id = p.id 
      WHERE ${whereClause} 
      ${orderBy} 
      LIMIT ${offset}, ${limit}
    `;

    const [products] = await db.query(query, queryParams);

    // Fetch Variants Loop (Same as legacy)
    for (const product of products) {
      const [variants] = await db.query(
        "SELECT * FROM tbl_product_verient WHERE product_id = ?",
        [product.id],
      );
      product.verients = variants;
    }

    res.json({
      success: 1,
      status: 1,
      message: "success.",
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

// Get Single Product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: 0, message: "ID is required" });
    }

    // 1. Main Query: Product Details + Group Concat sizes/storages
    // Matches logic: INNER JOIN to ensure variants exist, and GROUP_CONCAT for aggregate fields
    const queryProduct = `
      SELECT 
        p.id,
        p.name,
        p.color,
        p.selling_price AS price,
        p.mrp,
        p.features AS description,
        p.img1,
        p.img2,
        p.img3,
        p.img4,
        p.img5,
        GROUP_CONCAT(DISTINCT pv.size) AS sizes,
        GROUP_CONCAT(DISTINCT pv.storage) AS storages
      FROM tbl_product p
      INNER JOIN tbl_product_verient pv ON pv.product_id = p.id
      WHERE MD5(p.id) = ?
      GROUP BY p.id;
    `;

    const [products] = await db.query(queryProduct, [req.params.id]);

    // Since we use aggregation without GROUP BY (like the legacy code),
    // it returns 1 row even if no match found (with NULLs), so checks are needed.
    // If 'id' is null/undefined in the result, the product doesn't exist/has no variants.
    if (!products[0] || !products[0].id) {
      return res
        .status(404)
        .json({ success: 0, message: "Product not found or has no variants" });
    }

    const product = products[0];

    // 2. Fetch Variants
    const [variants] = await db.query(
      "SELECT * FROM tbl_product_verient WHERE product_id = ?",
      [product.id],
    );
    product.verients = variants;

    // 3. Fetch Distinct Colors (Legacy logic: GROUP BY pv.color)
    const [colors] = await db.query(
      `SELECT 
        pv.color AS color_name,
        MIN(pv.img1) AS color_img
      FROM tbl_product_verient pv
      WHERE pv.product_id = ?
      GROUP BY pv.color;
      `,
      [product.id],
    );
    product.colors = colors;

    res.json({
      success: 1,
      status: 1,
      message: "success.",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  }
};

// Add Product
const addProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, disp_order, varient } = req.body;
    let variants = [];

    // Parse variants if sent as JSON string (legacy support) or array
    if (typeof varient === "string") {
      try {
        variants = JSON.parse(varient);
      } catch (e) {
        variants = [];
      }
    } else {
      variants = varient || [];
    }

    // 1. Check or Insert Product
    let productId;
    const [existingProduct] = await connection.query(
      "SELECT id FROM tbl_product WHERE name = ?",
      [name],
    );

    if (existingProduct.length > 0) {
      productId = existingProduct[0].id;
      // If updating, the legacy logic deleted all variants first.
      // We can follow that or make it smarter. Following legacy for consistency.
      await connection.query(
        "DELETE FROM tbl_product_verient WHERE product_id = ?",
        [productId],
      );

      // Update display order if needed
      if (disp_order) {
        await connection.query(
          "UPDATE tbl_product SET disp_order = ? WHERE id = ?",
          [disp_order, productId],
        );
      }
    } else {
      const [result] = await connection.query(
        "INSERT INTO tbl_product (name, disp_order) VALUES (?, ?)",
        [name, disp_order || 0],
      );
      productId = result.insertId;
    }

    // 2. Insert Variants
    let lastItem = {};

    for (let i = 0; i < variants.length; i++) {
      let v = variants[i];

      // Logic to inherit from previous item if fields are empty (Legacy PHP logic ported)
      if (i > 0) {
        v.name = !v.name || v.name === "-" ? lastItem.name : v.name;
        v.color = !v.color || v.color === "-" ? lastItem.color : v.color;
        v.size = !v.size || v.size === "-" ? lastItem.size : v.size;
        v.storage =
          !v.storage || v.storage === "-" ? lastItem.storage : v.storage;
        v.selling_price =
          !v.selling_price || v.selling_price === "-"
            ? lastItem.selling_price
            : v.selling_price;
        v.mrp = !v.mrp || v.mrp === "-" ? lastItem.mrp : v.mrp;
        v.features =
          !v.features || v.features === "-" ? lastItem.features : v.features;
        v.img1 = !v.img1 || v.img1 === "-" ? lastItem.img1 : v.img1;
        v.img2 = !v.img2 || v.img2 === "-" ? lastItem.img2 : v.img2;
        v.img3 = !v.img3 || v.img3 === "-" ? lastItem.img3 : v.img3;
        v.img4 = !v.img4 || v.img4 === "-" ? lastItem.img4 : v.img4;
        v.img5 = !v.img5 || v.img5 === "-" ? lastItem.img5 : v.img5;
      }

      // Update lastItem for next iteration
      lastItem = { ...v };

      // Ensure name is consistent
      if (!v.name) v.name = name;

      await connection.query(
        `
        INSERT INTO tbl_product_verient 
        (product_id, name, color, size, storage, selling_price, mrp, features, img1, img2, img3, img4, img5, from_csv)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          productId,
          v.name,
          v.color,
          v.size,
          v.storage,
          v.selling_price,
          v.mrp,
          v.features,
          v.img1,
          v.img2,
          v.img3,
          v.img4,
          v.img5,
          0,
        ],
      );
    }

    await connection.commit();
    logAction(req, "Add", "add_product");
    res.json({ success: 1, message: "Data added successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: 0, message: "Failed to add product" });
  } finally {
    connection.release();
  }
};

const deleteRecord = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id, type } = req.body; // type: 'PRODUCT' or 'VERIENT'

    if (!id || !type) {
      return res
        .status(400)
        .json({ success: 0, message: "ID and Type are required" });
    }

    if (type === "PRODUCT") {
      await connection.query(
        "DELETE FROM tbl_product_verient WHERE product_id = ?",
        [id],
      );
      await connection.query("DELETE FROM tbl_product WHERE id = ?", [id]);
    } else if (type === "VERIENT") {
      await connection.query("DELETE FROM tbl_product_verient WHERE id = ?", [
        id,
      ]);
    }

    logAction(req, "Delete", "delete_record");
    await connection.commit();
    res.json({ success: 1, message: "Data deleted successfully." });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  } finally {
    connection.release();
  }
};

const fs = require("fs");
const csv = require("csv-parser");
const logAction = require("../utils/logger");

const deleteAllRecords = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("TRUNCATE TABLE tbl_product_verient");
    await connection.query("TRUNCATE TABLE tbl_product");

    await connection.commit();
    logAction(req, "Delete", "delete_all_record");
    res.json({ success: 1, message: "All data deleted successfully." });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: 0, message: "Server Error" });
  } finally {
    connection.release();
  }
};

const updateProductOrder = async (req, res) => {
  try {
    const { id, disp_order } = req.body;
    if (!id) {
      return res.status(400).json({ success: 0, message: "ID is required" });
    }

    await db.query("UPDATE tbl_product SET disp_order = ? WHERE id = ?", [
      disp_order,
      id,
    ]);
    logAction(req, "Update", "update_product_order");

    res.json({ success: 1, message: "Order updated successfully." });
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
  const connection = await db.getConnection();

  fs.createReadStream(req.file.path)
    .pipe(csv({ headers: false })) // Treat as no-header to access by index like PHP
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        await connection.beginTransaction();

        // PHP Logic Recreation
        let lastItem = {};

        // Skip header row if needed. PHP code had $is_header that toggles.
        // Usually CSVs have headers. The PHP code:
        // while (($data = fgetcsv...)) { if ($is_header == 0) { ... } else { $is_header = 0; } }
        // This means it skips the first row.
        const dataRows = results.slice(1);

        for (const row of dataRows) {
          // csv-parser with headers:false returns object with keys '0', '1', '2'...
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

          // Inherit from last item if empty or '-'
          if (Object.keys(lastItem).length > 0) {
            name = name === "" || name === "-" ? lastItem.name : name;
            // If name changed, reset lastItem? PHP says:
            // if (count($last_item) !== 0 && $name != $last_item['name']) { $last_item = array(); }
            // Wait, if name is different, it clears last item. But wait, if name is passed as '', it inherits.
            // So effectively: if explicit name provided and different -> new product.
            // The PHP logic is a bit weird: "if name != last_item['name'] -> reset".
            // But name was just assigned from last_item['name'] if it was empty.
            // So this check is for when a NEW name is explicitly in the row.

            // Reuse logic:
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

          // Update user's lastItem for next row
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

          // 1. Check if product exists
          let productId;
          const [existing] = await connection.query(
            "SELECT id FROM tbl_product WHERE name = ?",
            [name],
          );

          if (existing.length > 0) {
            productId = existing[0].id;
          } else {
            // Create Product
            const [res] = await connection.query(
              "INSERT INTO tbl_product (name, description, category_id, disp_order, status, popular, trending) VALUES (?, ?, ?, ?, 1, 0, 0)",
              [name, "Description for " + name, 0, disp_order],
            );
            productId = res.insertId;
          }

          // 2. Insert Variant
          await connection.query(
            `INSERT INTO tbl_product_verient 
                 (product_id, color, size, storage, selling_price, mrp, features, img1, img2, img3, img4, img5, stock, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              productId,
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
              0,
            ],
          );
        }

        await connection.commit();
        logAction(req, "Upload", "upload_csv");
        // fs.unlinkSync(req.file.path);
        res.json({ success: 1, message: "CSV processed successfully" });
      } catch (error) {
        await connection.rollback();
        console.error("CSV Processing Error", error);
        res
          .status(500)
          .json({ success: 0, message: "Failed during CSV processing" });
      } finally {
        connection.release();
        // Attempt to cleanup file
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
    });
};

const updateProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { name, disp_order, variants, product } = req.body; // Products.jsx sends { product: {name...}, variants: [] }

    // Handle "product" wrapper from frontend
    const productName = name || (product && product.name);
    // const productCategory = product && product.category;

    // Support for legacy 'varient' key or 'variants'
    let finalVariants = variants || req.body.varient || [];
    if (typeof finalVariants === "string") {
      try {
        finalVariants = JSON.parse(finalVariants);
      } catch (e) {
        finalVariants = [];
      }
    }

    // Update Product Info
    await connection.query(
      "UPDATE tbl_product SET name = ?, disp_order = ? WHERE id = ?",
      [productName, disp_order || 0, id],
    );

    // Replace Variants
    await connection.query(
      "DELETE FROM tbl_product_verient WHERE product_id = ?",
      [id],
    );

    let lastItem = {};
    for (let i = 0; i < finalVariants.length; i++) {
      let v = finalVariants[i];
      // Logic to inherit from previous item
      if (i > 0) {
        v.name = !v.name || v.name === "-" ? lastItem.name : v.name;
        v.color = !v.color || v.color === "-" ? lastItem.color : v.color;
        v.size = !v.size || v.size === "-" ? lastItem.size : v.size;
        v.storage =
          !v.storage || v.storage === "-" ? lastItem.storage : v.storage;
        v.selling_price =
          !v.selling_price || v.selling_price === "-"
            ? lastItem.selling_price
            : v.selling_price;
        v.mrp = !v.mrp || v.mrp === "-" ? lastItem.mrp : v.mrp;
        v.features =
          !v.features || v.features === "-" ? lastItem.features : v.features;
        v.img1 = !v.img1 || v.img1 === "-" ? lastItem.img1 : v.img1;
        v.img2 = !v.img2 || v.img2 === "-" ? lastItem.img2 : v.img2;
        v.img3 = !v.img3 || v.img3 === "-" ? lastItem.img3 : v.img3;
        v.img4 = !v.img4 || v.img4 === "-" ? lastItem.img4 : v.img4;
        v.img5 = !v.img5 || v.img5 === "-" ? lastItem.img5 : v.img5;
      }
      lastItem = { ...v };
      if (!v.name) v.name = productName;

      await connection.query(
        "INSERT INTO tbl_product_verient (product_id, name, color, size, storage, selling_price, mrp, features, img1, img2, img3, img4, img5, from_csv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          v.name,
          v.color,
          v.size,
          v.storage,
          v.selling_price,
          v.mrp,
          v.features,
          v.img1,
          v.img2,
          v.img3,
          v.img4,
          v.img5,
          0,
        ],
      );
    }

    await connection.commit();
    res.json({ success: 1, message: "Product updated" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: 0, message: "Update failed" });
  } finally {
    connection.release();
  }
};

const deleteById = async (req, res) => {
  // Wrapper for REST delete
  req.body.id = req.params.id;
  req.body.type = "PRODUCT";
  return deleteRecord(req, res);
};

module.exports = {
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
