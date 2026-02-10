import React, { useState, useEffect } from "react";
import { localService } from "../../services/localService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await localService.getProducts({ start: 0, length: 100000 });
      setProducts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-right">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No products found in CSV.
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
                      <div className="font-medium text-gray-900">{p.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-500 font-mono">
                        {p.disp_order}
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
};

export default Products;
