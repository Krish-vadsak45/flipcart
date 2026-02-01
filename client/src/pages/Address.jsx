import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Address = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    pin: "",
    city: "",
    state: "AP",
    flat: "",
    area: "",
  });

  const states = [
    { code: "AP", name: "Andhra Pradesh" },
    { code: "AR", name: "Arunachal Pradesh" },
    { code: "AS", name: "Assam" },
    { code: "BR", name: "Bihar" },
    { code: "CT", name: "Chhattisgarh" },
    { code: "GA", name: "Goa" },
    { code: "GJ", name: "Gujarat" },
    { code: "HR", name: "Haryana" },
    { code: "HP", name: "Himachal Pradesh" },
    { code: "JK", name: "Jammu & Kashmir" },
    { code: "JH", name: "Jharkhand" },
    { code: "KA", name: "Karnataka" },
    { code: "KL", name: "Kerala" },
    { code: "MP", name: "Madhya Pradesh" },
    { code: "MH", name: "Maharashtra" },
    { code: "MN", name: "Manipur" },
    { code: "ML", name: "Meghalaya" },
    { code: "MZ", name: "Mizoram" },
    { code: "NL", name: "Nagaland" },
    { code: "OR", name: "Odisha" },
    { code: "PB", name: "Punjab" },
    { code: "RJ", name: "Rajasthan" },
    { code: "SK", name: "Sikkim" },
    { code: "TN", name: "Tamil Nadu" },
    { code: "TS", name: "Telangana" },
    { code: "TR", name: "Tripura" },
    { code: "UK", name: "Uttarakhand" },
    { code: "UP", name: "Uttar Pradesh" },
    { code: "WB", name: "West Bengal" },
    { code: "AN", name: "Andaman & Nicobar" },
    { code: "CH", name: "Chandigarh" },
    { code: "DN", name: "Dadra and Nagar Haveli" },
    { code: "DD", name: "Daman & Diu" },
    { code: "DL", name: "Delhi" },
    { code: "LD", name: "Lakshadweep" },
    { code: "PY", name: "Puducherry" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stateName =
      states.find((s) => s.code === formData.state)?.name || formData.state;
    const addressToSave = {
      ...formData,
      state_id: formData.state,
      state: stateName,
    };
    localStorage.setItem("address", JSON.stringify(addressToSave));
    navigate("/order-summary");
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="container mx-auto min-w-full p-3 pb-0 bg-white shadow-sm border border-transparent">
        <div className="flex items-center">
          <div className="w-[10%] absolute left-3" onClick={() => navigate(-1)}>
            <div className="">
              <img
                src="/assets/images/theme/back_dark.svg"
                alt="Back"
                className="w-5 h-5"
              />
            </div>
          </div>
          <div className="w-[80%]">
            <h4 className="pl-10 md:pl-30 mb-0 mt-1 ml-2  md:text-lg font-medium text-gray-700">
              Add delivery address
            </h4>
          </div>
        </div>
        <div className="w-full flex justify-center py-2">
          <img
            src="/assets/images/theme/progress-indicator-address.svg"
            alt="Progress"
            className="w-full max-w-min px-4"
          />
        </div>
      </div>

      <div className="mb-[70px] min-h-[calc(100vh-60px)]">
        <div className="py-1">
          <form onSubmit={handleSubmit} id="addressForm">
            <div className="p-2 m-2 rounded">
              {/* Floating Labels using Tailwind Peers */}
              <div className="relative mb-3">
                <input
                  type="text"
                  id="name"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
                <label
                  htmlFor="name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Full Name (Required)*
                </label>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  id="number"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={formData.number}
                  onChange={handleChange}
                />
                <label
                  htmlFor="number"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Mobile number (Required)*
                </label>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  id="pin"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={formData.pin}
                  onChange={handleChange}
                />
                <label
                  htmlFor="pin"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Pincode (Required)*
                </label>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    id="city"
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="city"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                  >
                    City (Required)*
                  </label>
                </div>
                <div className="relative w-1/2">
                  <select
                    id="state"
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    required
                    value={formData.state}
                    onChange={handleChange}
                  >
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                  <label
                    htmlFor="state"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                  >
                    State (Required)*
                  </label>
                </div>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  id="flat"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  value={formData.flat}
                  onChange={handleChange}
                />
                <label
                  htmlFor="flat"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  House No., Building Name (Required)*
                </label>
              </div>

              <div className="relative mb-3">
                <input
                  type="text"
                  id="area"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  value={formData.area}
                  onChange={handleChange}
                />
                <label
                  htmlFor="area"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Road name, Area, Colony (Required)*
                </label>
              </div>

              <div className="fixed bottom-0 left-0 w-full p-2 bg-transparent">
                <div className="w-[90%] mx-auto">
                  <button
                    type="submit"
                    className="w-full bg-[#FFC107] text-black font-semibold py-3 border-none rounded-sm shadow-sm cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Address;
