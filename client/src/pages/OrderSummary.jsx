import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OrderSummary = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [address, setAddress] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);

  useEffect(() => {
    // Load data from localStorage
    const savedProduct = localStorage.getItem("selected_verient");
    const savedAddress = localStorage.getItem("address");

    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    }
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
  }, []);

  const handleChangeAddress = () => {
    navigate("/address");
  };

  const handleContinue = () => {
    navigate("/payment");
  };

  const getVariantDetailString = () => {
    if (!product) return "";
    let parts = [];
    if (product.color) parts.push(product.color);
    if (product.size) parts.push(`(${product.size})`);
    if (product.storage) parts.push(`(${product.storage})`);
    return parts.join(" ");
  };

  if (!product || !address) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const discountAmount = product.mrp - product.selling_price;
  const discountPercent = (
    100 -
    (product.selling_price * 100) / product.mrp
  ).toFixed(0);

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      {/* Header */}
      <div className="container mx-auto min-w-full p-3 pb-0 bg-white sticky top-0 z-50">
        <div className="flex items-center pb-2">
          <div className="w-[10%]" onClick={() => navigate(-1)}>
            <div className="">
              <img
                src="/assets/images/theme/back_dark.svg"
                alt="Back"
                className="w-5 h-5"
              />
            </div>
          </div>
          <div className="w-[80%]">
            <h4 className="mb-0  text-lg text-gray-700">Order Summary</h4>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white pt-1">
        <div className="w-full flex justify-center">
          <img
            className="w-full px-4 "
            src="/assets/images/theme/progress-indicator-summary.png"
            alt="Progress"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white px-4 py-4 lg:-mt-43 top-0 z-50 relative">
        <div className="flex justify-between items-center w-full mb-2">
          <h3 className="text-[#111112] font-bold text-[18px]">Deliver to:</h3>
          <button
            className="text-[#2a55e5] text-[13px] border border-[#dbdbdb] px-2 py-1 rounded font-semibold"
            onClick={handleChangeAddress}
          >
            Change
          </button>
        </div>
        <div>
          <div className="flex gap-2 items-center mb-1">
            <h4 className="font-semibold text-[18px]">{address.name}</h4>
            <span className="bg-[#f0f2f5] text-[12px] text-[#717478] px-2 py-0.5 rounded font-medium">
              Home
            </span>
          </div>
          <div className="text-[14px] text-[#212121] mb-2 font-semibold leading-tight">
            {[
              address.flat,
              address.area,
              address.city,
              address.state,
              address.pin,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div className="text-[14px] text-[#212121] mt-2">
            {address.number}
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="bg-white px-3 py-2 mb-2">
        <div className="flex gap-2 mb-2">
          <p className="bg-[#00a098] text-white px-1 py-0.5 text-[12px] font-semibold">
            BESTSELLER
          </p>
          <p className="bg-[#c7ffd3] text-[#26a541] px-1.5 py-0.5 text-[12px] font-semibold">
            Hot Deal
          </p>
        </div>

        <div className="flex">
          <div className="relative">
            <div className="flex justify-center">
              <img
                src={product.img1}
                alt={product.name}
                className="h-20 object-contain"
              />
            </div>
            <div className="flex justify-center mt-2">
              <div className="border border-[#dbdbdb] px-3 py-0.8 text-[14px] font-semibold">
                Qty: 1
              </div>
            </div>
          </div>

          <div className="w-[70%] pl-3">
            <div className="text-[18px] mb-1 leading-tight">{product.name}</div>
            <p className="text-[14px] text-[#878787] mb-1">
              Multicolor |{" "}
              {/* <span className="text-black font-extrabold">
                {getVariantDetailString()}
              </span> */}
            </p>

            {/* Price Row */}
            <div className="flex items-center gap-2 mt-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 12 12"
                fill="none"
                className="mt-1"
              >
                <path
                  d="M6.73461 1V8.46236L9.5535 5.63352L10.5876 6.65767L5.99384 11.2415L1.41003 6.65767L2.42424 5.63352L5.25307 8.46236V1H6.73461Z"
                  fill="#008C00"
                ></path>
              </svg>
              <span className="font-bold text-[#008C00] text-[16px]">
                {discountPercent}% off
              </span>
              <span className="line-through text-[#878787] font-semibold text-[16px]">
                ₹{product.mrp}
              </span>
              <span className="text-[16px] font-bold">
                ₹{product.selling_price}
              </span>
            </div>

            {/* Offers/Coupons */}
            <div className="flex gap-3 items-center mt-1">
              <p className="text-[#008C00] text-[12px] font-bold">
                1 coupon applied
              </p>
              <div className="w-1 h-1 bg-[#008C00] rounded-full"></div>
              <p className="text-[#008C00] text-[12px] font-bold">
                1 offer available
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-[13px] mt-1 mb-4 border-gray-100 pt-2">
          <p>Delivery by</p>
          <p className="text-[#008C00] font-semibold">Free</p>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="px-3 flex gap-3 bg-[#f0f2f5] items-center">
        <img
          src="/assets/images/cart.webp"
          className="w-[9%] h-[4%] py-2 object-contain"
          alt="cart"
        />
        <div className="py-2 text-[13px] text-gray-700">
          Cancellation is allowed up to 48 hours after placing the order.
        </div>
      </div>

      {/* Invoice Section */}
      <div className="px-4 py-3 mb-2 bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/assets/images/invoice.webp"
            className="w-5 h-5 object-contain"
            alt="invoice"
          />
          <div className="text-[15px]">Invoice</div>
        </div>
        <div className="text-[#2874f0] text-[15px]">Add Email</div>
      </div>

      {/* VIP & Donation */}
      <div>
        {/* VIP Card */}
        <div className="flex p-2 bg-[#f0f2f5] gap-2">
          <div className="w-[20%]">
            <img
              src="/assets/images/vip-card.png"
              className="w-full h-auto"
              alt="VIP"
            />
          </div>
          <div className="w-[78%]">
            <p className="font-bold text-[15px] pt-1 mb-0 leading-tight">
              Get Benefit Worth of ₹10000 Per Year
            </p>
            <p className="text-[12px] pt-1 mb-0 leading-tight">
              For Exclusive Discount up to 80% on All product up to 12 Months.
              Limited Time Offer | Become VIP Member
            </p>
            <div className="flex gap-3 pt-2 items-center">
              <p className="text-[15px] font-bold">₹199 For 12 Months</p>
              <button
                className="px-2 rounded text-[13px] h-[29px] cursor-pointer bg-[#FBBC05] border-none"
                onClick={handleContinue}
              >
                Get VIP Member
              </button>
            </div>
          </div>
        </div>

        {/* Donation Card */}
        <div className="w-full bg-white text-left box-border mt-2 p-2">
          <div className="flex items-center mb-3 pt-2">
            <div className="w-[74%] pl-2">
              <h2 className="text-[14px] m-0 text-[#333] font-semibold">
                Direct UPI Payment
              </h2>
              <p className="text-[13px] text-[#666] m-1 mt-1">
                Support transformative social work in India
              </p>
            </div>
            <img
              src="/assets/images/Image (1).png"
              className="w-[20%] ml-4"
              alt="Donation"
            />
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between my-3 mx-3">
            {[10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() =>
                  setDonationAmount((prev) => (prev === amt ? 0 : amt))
                }
                className={`w-[22%] py-1.5 text-[16px] border border-[#ddd] rounded-[20px] transition-all cursor-pointer duration-300 hover:bg-gray-100 hover:scale-105 ${donationAmount === amt ? "bg-blue-600 text-white border-blue-600" : "bg-white text-[#333]"}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <hr className="border-gray-200" />
          <p className="text-[13px] text-[#888] p-2 font-semibold">
            Note: GST and No cost EMI will not be applicable
          </p>
        </div>

        {/* Bank Offer Banner */}
        <div className="px-3 py-2 flex gap-3 bg-[#e7f8ec] mt-[-11px] mb-2">
          <img
            src="/assets/images/card.webp"
            className="w-[9%] h-[4%] object-contain"
            alt="Card"
          />
          <div className="text-[14px] mt-1 text-gray-700">
            Continue to the next page for Bank Offers.
          </div>
        </div>
      </div>

      {/* Price Details */}
      <div className="bg-white px-3 py-4 mb-2">
        <h3 className="text-[18px]  mb-2">Price Details</h3>
        <div className="mt-2 text-[14px]">
          <div className="flex justify-between my-3">
            <span>Price (1 item)</span>
            <span>₹{product.mrp}</span>
          </div>
          <div className="flex justify-between my-3">
            <span>Discount</span>
            <span className="text-green-600">-₹{discountAmount}</span>
          </div>
          <div className="flex justify-between my-3">
            <span>Delivery Charges</span>
            <span className="text-green-600">FREE Delivery</span>
          </div>
          <div className="flex justify-between my-3 pt-3 border-t border-dashed border-gray-300 text-[14px]">
            <span>Total Amount</span>
            <span>
              ₹{(parseFloat(product.selling_price) + donationAmount).toFixed(2)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t font-extralight border-gray-100 text-green-600">
            You will save <span className="">-₹{discountAmount}</span> on this
            order
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="flex justify-center items-center mb-0 md:mb-20 p-4">
        <div className="flex justify-evenly items-center ">
          <img
            className="w-[30px] block"
            src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90"
            alt="Safety"
          />
          <div className="text-center w-50 font-bold text-[#878787] text-[12px] ">
            Safe and secure payments. Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>

      {/* Footer normal screen / Continue Button */}
      <div className="fixed bottom-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 hidden sm:flex z-50 justify-start items-center mx-auto left-0 right-0">
        <div className="w-[50%] flex flex-col gap-2.5">
          <span className="line-through text-[#878787] text-[12px] block">
            ₹{product.mrp}
          </span>
          <span className="text-[15px] block leading-none">
            ₹{(parseFloat(product.selling_price) + donationAmount).toFixed(2)}
          </span>
        </div>
        <button
          className="w-[12%] bg-[#FFC107] text-black font-semibold py-3 border-none rounded-sm shadow-sm text-[14px] cursor-pointer"
          onClick={handleContinue}
        >
          Continue To Payment
        </button>
      </div>

      {/* Footer Mobile/small screen / Continue Button */}
      <div className="w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-4 py-3 flex sm:hidden justify-between items-center mx-auto">
        <div className="flex flex-col">
          <span className="line-through text-[#878787] text-[14px]">
            ₹{product.mrp}
          </span>
          <span className="text-[20px] font-bold text-[#212121] leading-tight">
            ₹{(parseFloat(product.selling_price) + donationAmount).toFixed(0)}
          </span>
        </div>
        <button
          className="bg-[#FBBC05] text-black font-bold py-3 px-6 rounded-md shadow-sm text-[16px] cursor-pointer"
          onClick={handleContinue}
        >
          Continue To Payment
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
