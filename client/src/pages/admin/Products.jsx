import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Configure axios base (assuming Vite proxy or CORS)
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    disp_order: "", // Replaced category with disp_order
    // Base product might not have much else if everything is in variants
  });

  // Variant State
  // Structure: { id: timestamp, color: "", size: "", storage: "", mrp: "", selling_price: "", features: "", img1..5: "", collapsed: false }
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products by requesting a large length
      const res = await api.get(`/products?start=0&length=100000`);

      const list = res.data.data || [];
      // const total = res.data.recordsTotal || 0;

      setProducts(list);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: "", disp_order: "" });
    setVariants([
      {
        id: Date.now(),
        color: "",
        size: "",
        storage: "",
        mrp: "",
        selling_price: "",
        features: "",
        img1: "",
        img2: "",
        img3: "",
        img4: "",
        img5: "",
        collapsed: false,
      },
    ]);
    setView("form");
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    setView("form");
    setLoading(true);
    try {
      // Fetch details including variants
      const res = await api.get(`/products/${id}`);
      const data = res.data;

      setFormData({
        name: data.name || data.product?.name || "",
        disp_order: data.disp_order || data.product?.disp_order || "",
      });

      // Map existing variants
      const vars = data.variants || data.verients || [];
      if (Array.isArray(vars)) {
        setVariants(
          vars.map((v) => ({
            ...v,
            id: v.id || Math.random(),
            collapsed: true, // Auto collapse existing
            // Ensure fields exist
            color: v.color || "",
            size: v.size || "",
            storage: v.storage || "",
            mrp: v.mrp || "",
            selling_price: v.selling_price || "",
            features: v.features || "",
            img1: v.img1 || "",
            img2: v.img2 || "",
            img3: v.img3 || "",
            img4: v.img4 || "",
            img5: v.img5 || "",
          })),
        );
      } else {
        setVariants([]);
      }
    } catch (err) {
      console.error(err);
      alert("Could not load product details");
      setView("list");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleUpdateOrder = async (id, newOrder) => {
    try {
      await api.put(`/products/${id}/order`, { disp_order: newOrder });
      fetchProducts();
    } catch (err) {
      alert("Failed to update order");
    }
  };

  const handleImageUpload = async (e, variantId, imgNum) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        updateVariant(variantId, `img${imgNum}`, res.data.imageUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  // --- Variant Logic ---

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(),
        color: "",
        size: "",
        storage: "",
        mrp: "",
        selling_price: "",
        features: "",
        img1: "",
        img2: "",
        img3: "",
        img4: "",
        img5: "",
        collapsed: false,
      },
    ]);
  };

  const removeVariant = (id) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const toggleVariant = (id) => {
    setVariants(
      variants.map((v) =>
        v.id === id ? { ...v, collapsed: !v.collapsed } : v,
      ),
    );
  };

  const updateVariant = (id, field, value) => {
    const newVars = [...variants];
    const idx = newVars.findIndex((v) => v.id === id);
    if (idx > -1) {
      newVars[idx][field] = value;
      setVariants(newVars);
    }
  };

  // --- Save ---

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        varient: variants,
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      alert("Saved successfully!");
      setView("list");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  const handleDeleteAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to DELETE ALL products? This cannot be undone.",
      )
    ) {
      try {
        await api.post("/products/delete-all");
        fetchProducts();
        alert("All products deleted successfully.");
      } catch (err) {
        console.error(err);
        alert("Error deleting data.");
      }
    }
  };

  const handleUploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/products/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("CSV Uploaded Successfully!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error uploading CSV");
    } finally {
      e.target.value = null; // Reset input
    }
  };

  if (view === "list") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <div className="flex gap-2">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={handleDeleteAll}
            >
              <Trash2 size={18} />
              <span className="hidden md:inline">Delete All</span>
            </button>

            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleUploadCSV}
              />
              <Layers size={18} />
              <span className="hidden md:inline">Upload CSV</span>
            </label>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3 text-right">Order</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {p.img1 ? (
                          <img
                            src={p.img1}
                            alt={p.name}
                            className="h-12 w-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {p.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            className="w-16 px-2 py-1 text-sm border rounded text-center"
                            defaultValue={p.disp_order}
                            onBlur={(e) =>
                              handleUpdateOrder(p.id, e.target.value)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 text-white bg-cyan-500 rounded hover:bg-cyan-600 transition-colors"
                            onClick={() => handleEdit(p.id)}
                            title="View/Edit"
                          >
                            <Layers size={14} />
                          </button>
                          <button
                            className="p-1.5 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                            onClick={() => handleEdit(p.id)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="p-1.5 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editingId ? "Edit Product" : "Add Product"}
        </h1>
        <button
          onClick={() => setView("list")}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Main Product Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.disp_order}
                onChange={(e) =>
                  setFormData({ ...formData, disp_order: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Variants</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, index) => (
              <div
                key={v.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Accordion Header with Inputs inside, matching legacy manage_products.js logic */}
                <div
                  className="bg-gray-50 p-4 cursor-pointer select-none"
                  onClick={(e) => {
                    // Only toggle if not clicking an input
                    if (
                      e.target.tagName !== "INPUT" &&
                      e.target.tagName !== "BUTTON"
                    ) {
                      toggleVariant(v.id);
                    }
                  }}
                >
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                    {/* Color */}
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <label className="text-sm font-medium text-gray-700 w-12 text-right">
                        Color
                      </label>
                      <input
                        type="text"
                        className="w-full text-sm border-gray-300 rounded px-2 py-1 border"
                        placeholder="Enter Color"
                        value={v.color}
                        onChange={(e) =>
                          updateVariant(v.id, "color", e.target.value)
                        }
                      />
                    </div>

                    {/* Size */}
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <label className="text-sm font-medium text-gray-700 w-12 text-right">
                        Size
                      </label>
                      <input
                        type="text"
                        className="w-full text-sm border-gray-300 rounded px-2 py-1 border"
                        placeholder="Enter Size"
                        value={v.size}
                        onChange={(e) =>
                          updateVariant(v.id, "size", e.target.value)
                        }
                      />
                    </div>

                    {/* Storage */}
                    <div className="flex items-center gap-2 flex-1 w-full">
                      <label className="text-sm font-medium text-gray-700 w-16 text-right">
                        Storage
                      </label>
                      <input
                        type="text"
                        className="w-full text-sm border-gray-300 rounded px-2 py-1 border"
                        placeholder="Enter Storage"
                        value={v.storage}
                        onChange={(e) =>
                          updateVariant(v.id, "storage", e.target.value)
                        }
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1 bg-white border border-red-200 rounded-full"
                        title="Remove Variant"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVariant(v.id);
                        }}
                      >
                        <X size={16} />
                      </button>
                      {v.collapsed ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronUp size={18} />
                      )}
                    </div>
                  </div>
                </div>

                {!v.collapsed && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MRP
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={v.mrp}
                        onChange={(e) =>
                          updateVariant(v.id, "mrp", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selling Price
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={v.selling_price}
                        onChange={(e) =>
                          updateVariant(v.id, "selling_price", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Features (HTML)
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={v.features}
                        onChange={(value) =>
                          updateVariant(v.id, "features", value)
                        }
                        className="bg-white rounded-lg"
                      />
                    </div>
                    {/* Images 1-5 */}
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image {num} URL
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={v[`img${num}`] || ""}
                          placeholder="http://..."
                          onChange={(e) =>
                            updateVariant(v.id, `img${num}`, e.target.value)
                          }
                        />
                        {/* File Upload Trigger */}
                        <input
                          type="file"
                          className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                          onChange={(e) => handleImageUpload(e, v.id, num)}
                        />
                        {v[`img${num}`] && (
                          <div className="mt-2">
                            <img
                              src={v[`img${num}`]}
                              alt="prev"
                              className="h-20 border rounded object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setView("list")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default Products;
