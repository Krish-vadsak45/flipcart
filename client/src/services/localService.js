import { INITIAL_SETTINGS } from "../data/config";

let cachedProducts = null;

const parseCSV = (data) => {
  const result = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    const next = data[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell);
        cell = "";
      } else if (char === "\n" || char === "\r") {
        row.push(cell);
        if (row.length > 1 || row[0] !== "") result.push(row);
        row = [];
        cell = "";
        if (char === "\r" && next === "\n") i++;
      } else {
        cell += char;
      }
    }
  }
  if (row.length > 0 || cell !== "") {
    row.push(cell);
    result.push(row);
  }
  return result;
};

const ensureLoaded = async () => {
  if (cachedProducts) return cachedProducts;

  try {
    const response = await fetch("/data/vercel-sample.csv");
    const text = await response.text();
    const rows = parseCSV(text);
    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const idIdx = headers.indexOf("id");

    const dataRows = rows.slice(1);
    let products = [];
    let lastItem = {};

    for (const row of dataRows) {
      const offset = idIdx !== -1 ? 1 : 0;
      let csvId = idIdx !== -1 ? row[idIdx]?.trim() : null;

      let name = row[0 + offset] ? row[0 + offset].trim() : "";
      let color = row[1 + offset] ? row[1 + offset].trim() : "";
      let size = row[2 + offset] ? row[2 + offset].trim() : "";
      let storage = row[3 + offset] ? row[3 + offset].trim() : "";
      let selling_price = row[4 + offset] ? row[4 + offset].trim() : "";
      let mrp = row[5 + offset] ? row[5 + offset].trim() : "";
      let features = row[6 + offset] ? row[6 + offset].trim() : "";
      let img1 = row[7 + offset] ? row[7 + offset].trim() : "";
      let img2 = row[8 + offset] ? row[8 + offset].trim() : "";
      let img3 = row[9 + offset] ? row[9 + offset].trim() : "";
      let img4 = row[10 + offset] ? row[10 + offset].trim() : "";
      let img5 = row[11 + offset] ? row[11 + offset].trim() : "";
      let disp_order = row[12 + offset] ? row[12 + offset].trim() : "99999";

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
          features === "" || features === "-" ? lastItem.features : features;
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

      let product = products.find(
        (p) => p.name === name || (csvId && String(p.id) === String(csvId)),
      );
      if (!product) {
        product = {
          id: csvId || Date.now() + Math.floor(Math.random() * 1000),
          md5_id: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
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

    cachedProducts = products;
    return products;
  } catch (error) {
    console.error("Failed to load CSV:", error);
    return [];
  }
};

export const localService = {
  // --- Auth ---
  login: async (email, password) => {
    if (!email || !password) {
      return { success: 0, message: "Email and Password are required." };
    }
    if (email === "flipcart" && password === "flipcart123") {
      const userData = {
        _id: "hardcoded_admin_id",
        name: "Admin",
        email: "flipcart",
        role: "admin",
      };
      return {
        success: 1,
        message: "User logged in successfully.",
        data: userData,
      };
    }
    return { success: 0, message: "Invalid credentials." };
  },

  // --- Settings ---
  getSettings: async () => {
    return {
      success: true,
      data: INITIAL_SETTINGS,
    };
  },

  // --- Products ---
  getProducts: async (query = {}) => {
    const { start = 0, length = 10, search = "" } = query;
    let products = await ensureLoaded();

    if (search) {
      const searchValue = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchValue) ||
          p.verients?.some(
            (v) =>
              v.color?.toLowerCase().includes(searchValue) ||
              v.size?.toLowerCase().includes(searchValue) ||
              v.name?.toLowerCase().includes(searchValue),
          ),
      );
    }

    const total = products.length;
    products.sort((a, b) => {
      const orderA = parseInt(a.disp_order) || 999999;
      const orderB = parseInt(b.disp_order) || 999999;
      return orderA - orderB;
    });

    const data = products.slice(Number(start), Number(start) + Number(length));

    return {
      success: 1,
      recordsTotal: total,
      recordsFiltered: total,
      data: data,
    };
  },

  getProductById: async (id) => {
    const products = await ensureLoaded();
    const product = products.find(
      (p) => String(p.id) === String(id) || String(p.md5_id) === String(id),
    );
    if (product) return { success: true, ...product };
    return { success: false, message: "Product not found" };
  },
};
