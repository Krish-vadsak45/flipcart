import { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { localService } from "../services/localService";
import "./ProductDetails.css"; // Import legacy styles for product detail section

const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Timers state
  const [offerTime, setOfferTime] = useState({ m: 16, s: 31 });
  const [deliveryTime, setDeliveryTime] = useState({ m: 15, s: 10 });
  // eslint-disable-next-line no-unused-vars
  const [deliveryDate, setDeliveryDate] = useState("");

  // Random data constants (stable per mount)
  const [randomData] = useState(() => {
    const rParam = searchParams.get("r");
    const r1Param = searchParams.get("r1");
    // Generate fallbacks if params are missing (stable for this mount)
    const fallbackRating = (Math.random() * (5 - 4) + 4).toFixed(1);
    const fallbackCount = Math.floor(Math.random() * (9500 - 7500 + 1)) + 7500;

    return {
      stockLeft: Math.floor(Math.random() * (39 - 4 + 1)) + 4,
      randomRating: rParam || fallbackRating,
      ratingReviews: r1Param || fallbackCount, // Consolidated to use r1Param or fallback
      peopleOrdered: Math.floor(Math.random() * (39999 - 23999 + 1)) + 23999,
    };
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await localService.getProductById(id);
        if (response.success) {
          setProduct(response);
          console.log("Fetched product:", response);
        } else {
          toast.error("Failed to load product");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Delivery Date Logic
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Deliver in 2 days
    const options = { weekday: "short", month: "short", day: "numeric" };
    setDeliveryDate(today.toLocaleDateString("en-US", options));
  }, []);

  // Timers Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferTime((prev) => {
        if (prev.s === 0) {
          if (prev.m === 0) return { m: 16, s: 31 }; // Reset
          return { m: prev.m - 1, s: 59 };
        }
        return { ...prev, s: prev.s - 1 };
      });

      setDeliveryTime((prev) => {
        if (prev.s === 0) {
          if (prev.m === 0) return { m: 15, s: 10 }; // Reset
          return { m: prev.m - 1, s: 59 };
        }
        return { ...prev, s: prev.s - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { variant, images } = useMemo(() => {
    if (!product || !product.verients) return { variant: null, images: [] };

    let v = product.verients[0];
    if (product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0].color_name;
      const matchingVariant = product.verients.find(
        (vr) => vr.color === firstColor,
      );
      if (matchingVariant) {
        v = matchingVariant;
      }
    }

    const imgs = [v.img1, v.img2, v.img3, v.img4, v.img5].filter(Boolean);

    return { variant: v, images: imgs };
  }, [product]);

  // Auto-slide images matching legacy behavior
  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  // Size Selector Logic
  useEffect(() => {
    const savedSize = localStorage.getItem("selectedSize");
    if (savedSize) setSelectedSize(savedSize);
  }, []);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    localStorage.setItem("selectedSize", size);
  };

  const getActiveVariant = () => {
    if (!product || !product.verients) return null;
    let v = product.verients[0];
    if (product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0].color_name;
      const matchingVariant = product.verients.find(
        (vr) => vr.color === firstColor,
      );
      if (matchingVariant) {
        v = matchingVariant;
      }
    }
    return v;
  };

  const handleBuyAction = () => {
    const v = getActiveVariant();
    if (v) {
      localStorage.setItem("selected_verient", JSON.stringify(v));
      navigate("/address");
    }
  };

  const handleAddToCart = () => {
    // Matches legacy behavior: Both Add to Cart and Buy Now redirect to address
    handleBuyAction();
  };

  const handleBuyNow = () => {
    handleBuyAction();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!product || !variant)
    return (
      <div className="flex justify-center items-center h-screen">
        Product Not Found
      </div>
    );

  return (
    <div className=" min-h-screen font-sans text-[#212121]">
      {/* Header */}
      <div className="bg-[#2874f0] text-white py-2 shadow-md">
        <div className="w-full">
          <div className="flex items-center flex-wrap">
            <div className="flex-[0_0_8.333333%] max-w-[8.333333%] px-[15px]">
              <div className="menu-icon" id="back_btn">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-transparent border-0 p-0"
                >
                  <img
                    src="/assets/images/theme/back.svg"
                    alt="Back"
                    className="w-5 h-5 invert brightness-0"
                  />
                </button>
              </div>
            </div>
            <div className="flex-[0_0_16.666667%] max-w-[16.666667%] px-[15px]">
              <div className="menu-logo">
                <Link to="/" className="block" style={{ width: "85px" }}>
                  <img
                    style={{ width: "85px", height: "30px" }}
                    src="/img/Q18Ifxk.png"
                    alt="Logo"
                  />
                </Link>
              </div>
            </div>
            <div className="flex-[0_0_50%] max-w-[50%] px-[15px]"></div>
            <div className="flex-[0_0_8.333333%] max-w-[8.333333%] px-[15px]">
              <div className="menu-icon">
                <img
                  src="/assets/images/theme/search.svg"
                  alt="Search"
                  className="w-4 h-4"
                />
              </div>
            </div>
            <div className="flex-[0_0_8.333333%] max-w-[8.333333%] px-[15px]">
              <div className="menu-icon">
                <img
                  src="/assets/images/shoppings.png"
                  alt="Cart"
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto bg-[#F1F2F4] pb-2 shadow-sm">
        {/* Product Slider & Main Card */}
        <div className="bg-white relative">
          <div className="flex justify-center bg-[#F1F2F4]">
            <div className="flex justify-center w-[1300px] bg-white border border-gray-100">
              {/* Slider */}
              <div className="relative w-full flex flex-col items-center justify-center place-items-center pt-4">
                <div className="w-full h-[350px] flex items-center justify-center p-4">
                  <img
                    src={
                      images[activeImgIndex] ||
                      "https://via.placeholder.com/300"
                    }
                    alt="Product"
                    className="max-h-full object-contain"
                  />
                </div>

                {/* Dots */}
                <div className="flex gap-1.5 justify-center w-full mt-2 mb-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`h-1.5 rounded-full transition-all h-2.5 w-2.5 ${idx === activeImgIndex ? "bg-gray-400" : " bg-gray-200 cursor-pointer"}`}
                    ></div>
                  ))}
                </div>

                {/* Stock Warning */}
                <div className="w-full text-center border-b border-gray-100">
                  <h4 className="m-0 font-semibold text-[19px] text-gray-800">
                    Only{" "}
                    <span className="text-[#DC3545] font-bold">
                      {randomData.stockLeft}
                    </span>{" "}
                    Left in Stock
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white mb-1 mt-1 border-t border-gray-100">
          <div className="px-4 py-3">
            <h1 className="text-sm text-gray-900 leading-normal mb-2 text-[#212121]">
              {variant?.name || product?.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#388e3c] text-white text-[14px]  px-1.5 py-0.2 rounded flex items-center gap-1">
                <span>{randomData.randomRating}</span>
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTYuNSA5LjQzOWwtMy42NzQgMi4yMy45NC00LjI2LTMuMjEtMi44ODMgNC4yNTQtLjQwNEw2LjUuMTEybDEuNjkgNC4wMSA0LjI1NC40MDQtMy4yMSAyLjg4Mi45NCA0LjI2eiIvPjwvc3ZnPg=="
                  className="w-3.2"
                  alt="star"
                />
              </div>
              <span className="text-[#878787] text-[14px] font-medium">
                {randomData.ratingReviews} Ratings
              </span>
              <img
                src="/assets/images/plue-fassured.png"
                alt="Assured"
                className="h-7 ml-2"
              />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[#388e3c] text-[20px] font-bold">
                {Math.round(
                  ((variant.mrp - variant.selling_price) / variant.mrp) * 100,
                )}
                % off
              </span>
              <span className="text-gray-500 font-bold line-through text-[18px] ml-1">
                {variant.mrp}
              </span>
              <span className="text-[20px] font-bold text-[#212121] ml-1">
                ₹{variant.selling_price}
              </span>
            </div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="bg-white mb-0.5 p-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="/assets/images/Incresase.svg"
              alt="Trending"
              className="w-9 h-9"
            />
            <div className="text-[14px] text-gray-800">
              <span className="text-[#C70055]">{randomData.peopleOrdered}</span>{" "}
              people ordered this in the last 7 days
            </div>
          </div>
        </div>

        {/* Offer Timer */}
        <div className="bg-white border-t border-b mb-1 border-gray-100 py-3 text-center">
          <h4 className="m-0 font-normal text-[19px] text-gray-800 ">
            Offer ends in{" "}
            <span className="text-[#FB641B]">
              {String(offerTime.m).padStart(2, "0")}min{" "}
              {String(offerTime.s).padStart(2, "0")}sec
            </span>
          </h4>
        </div>

        {/* Delivery Info */}
        <div className="bg-white p-2 flex items-start gap-4">
          <img
            src="https://i.ibb.co/sd0mx6xW/dd.webp"
            alt="Truck"
            className="w-6 h-6 object-contain"
          />
          <div className="flex-1">
            <div className="text-[14px]">
              <span className="text-[#388e3c] font-bold text-[14px]">
                FREE Delivery
              </span>
              <span className="mx-1 text-[#1a1616] text-[12px] font-bold">
                •
              </span>
              <span className="text-[#212121] font-bold text-[14px]">
                Delivery by
                {/* {deliveryDate} */}
              </span>
            </div>
            <div className="text-[13px] text-gray-500 mt-1">
              If ordered within{" "}
              <span className="text-[#C70055] font-medium">
                {deliveryTime.m}m {deliveryTime.s}s
              </span>
            </div>
          </div>
          <div className="self-center">
            <svg width="12" height="12" fill="none" viewBox="0 0 17 17">
              <path
                d="m6.627 3.749 5 5-5 5"
                stroke="#111112"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full px-2 py-3 flex bg-white border border-gray-200 rounded-[0.25rem] ">
          <div className="flex-[0_0_33.333333%] max-w-[33.333333%] flex flex-col items-center justify-center px-1">
            <img
              src="/assets/images/replacement.png"
              alt="Replacement"
              className="mb-3 h-7"
            />
            <span className="text-[12px] text-[#111112] text-center tracking-[0.3px] leading-[16px]">
              7 days Replacement
            </span>
          </div>
          <div className="flex-[0_0_33.333333%] max-w-[33.333333%] flex flex-col items-center justify-center px-1">
            <img
              src="/assets/images/non-cod.png"
              alt="No COD"
              className="mb-3 h-7"
            />
            <span className="text-[12px] text-[#111112] text-center tracking-[0.3px] leading-[16px]">
              No Cash On Delivery
            </span>
          </div>
          <div className="flex-[0_0_33.333333%] max-w-[33.333333%] flex flex-col items-center justify-center px-1">
            <img
              src="/assets/images/plue-fassured.png"
              alt="Plus"
              className="mb-3 mt-1 h-5"
            />
            <span className="text-[12px] text-[#111112] text-center tracking-[0.3px] leading-[16px]">
              Plus (F-Assured)
            </span>
          </div>
        </div>

        {/* Product Detail Section */}
        <div className="container-fluid product-detail px-0 py-3 mb-4 card">
          <h3 className="txt-product-detail">Product Detail</h3>
          <div
            className="product-details"
            dangerouslySetInnerHTML={{ __html: variant.features }}
          />

          <img
            src="/assets/images/review_1.jpg"
            alt="Review 1"
            style={{ width: "100%" }}
          />
          <img
            src="/assets/images/review_2.jpg"
            alt="Review 2"
            style={{ width: "100%" }}
          />
          <img
            src="/assets/images/review_3.jpg"
            alt="Review 3"
            style={{ width: "100%" }}
          />
          <img
            src="/assets/images/review_4.jpg"
            alt="Review 4"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-sm flex z-50 h-[50px]">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-white text-[#212121] font-bold text-[14px] border-t border-gray-200 active:scale-[0.98] cursor-pointer"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-[#ffc200] text-[#212121] font-bold text-[14px] active:scale-[0.98] cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
