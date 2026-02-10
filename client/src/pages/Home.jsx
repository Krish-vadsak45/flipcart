import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import CategoryStrip from "../components/CategoryStrip";
import DealsOfTheDay from "../components/DealsOfTheDay";
import { localService } from "../services/localService";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Categories Mapping based on available assets
  const categories = [
    { name: "Categories", img: "/assets/images/theme/bars.svg" },
    { name: "Offer Zone", img: "/assets/images/0f3d008be60995d4.webp" },
    { name: "Mobiles", img: "/assets/images/0f3d008be60995d4.webp" },
    { name: "Fashion", img: "/assets/images/824aa3a83b4057eb.webp" },
    { name: "Electronics", img: "/assets/images/6ecb75e51b607880.webp" },
    { name: "Home", img: "/assets/images/1faac897db7fa1e8.webp" },
    { name: "Appliances", img: "/assets/images/356d37e9512c7fcb.webp" },
    { name: "Toys & Baby", img: "/assets/images/418dfd603e730185.webp" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const length = 10;
        const start = (page - 1) * length;
        const res = await localService.getProducts({ start, length });
        if (res.success && res.data.length > 0) {
          setProducts((prev) => {
            const newProducts = res.data.filter(
              (p) => !prev.some((existing) => existing.id === p.id),
            );
            return [...prev, ...newProducts];
          });
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasMore) {
      fetchProducts();
    }
  }, [page]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 105 >=
        document.documentElement.scrollHeight
      ) {
        if (!loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="bg-gray-100 min-h-screen pb-2">
      {/* Category Strip */}
      <CategoryStrip />

      {/* Hero Banner */}
      <div className="w-full bg-white -mt-0.5">
        <img
          src="/assets/images/bn1.jpg"
          alt="Bank Offer"
          className="w-full h-auto rounded-sm"
        />
      </div>

      {/* Deals of the Day */}
      <DealsOfTheDay />

      {/* Products Grid Section */}
      <div className="bg-white mb-2">
        <div className="grid grid-cols-2">
          {products.length > 0 &&
            products.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
        </div>

        {loading && (
          <div className="text-center py-6 w-full bg-white">
            <span className="text-gray-500 font-medium text-sm">
              Loading more products...
            </span>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-10">No Products Found</div>
        )}
      </div>
    </div>
  );
};

export default Home;
