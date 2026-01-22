import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    cmp_name: "",
    cmp_email: "",
    admin_email: "",
    admin_email_password: "",
    contact1: "",
    contact2: "",
    address: "",
    show_gpay: true,
    pay_type: false, // false = UPI (pay_type_1), true = Common (pay_type_2)
    payment_script: "",
    tb_password: "",
    allowed_ip: "",
    upi: "",
    pixel: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/settings");
      // Mapping matching get_data from manage_setting.js
      if (res.data.success) {
        const d = res.data.data;
        setFormData({
          id: d.id,
          cmp_name: d.company_name || "",
          cmp_email: d.company_email || "",
          admin_email: d.admin_email || "",
          admin_email_password: d.admin_email_password || "",
          contact1: d.contact1 || "",
          contact2: d.contact2 || "",
          address: d.address || "",
          show_gpay: d.show_gpay == 1 || d.show_gpay === true,
          pay_type: d.pay_type == 1 || d.pay_type === true,
          payment_script: d.payment_script || "",
          tb_password: d.tb_password || "",
          allowed_ip: d.allowed_ip || "",
          upi: d.upi || "",
          pixel: d.pixel || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/settings", formData);
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading settings...</div>
    );

  return (
    <div className="container-fluid p-0">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-bold text-gray-800">Settings</h4>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* 
               Legacy Project Notes:
               Many fields were hidden with 'd-none' in manage_setting.php.
               However, the React implementation below RETHINKS this.
               For exact fidelity, we should respect the 'd-none' class logic.

               Visible Fields in Legacy:
               - Show Gpay (Switch)
               - Use Common Payment System (Switch) -> Toggles between UPI and Payment Script
               - Password (tb_password)
               - Pixel Code
               - Submit Button
               
               Hidden Fields in Legacy (class="d-none"):
               - Company Name, Company Email
               - Admin Email, Admin Password
               - Contact 1, Contact 2
               - Address
               - IP Allowed (Settings for this EXIST in get_data, but DOM uses d-none)
            */}

            {/* HIDDEN FIELDS - Keeping them in DOM but hidden to match legacy behavior exactly if desired, 
                or we can just omit rendering. Since the user asked for "same logic", standard practice 
                is that if they are hidden in legacy, they are hidden here. 
                I will wrap them in a hidden div for data retention but invisibility.
            */}
            <div className="hidden">
              <input
                type="text"
                id="cmp_name"
                value={formData.cmp_name}
                onChange={handleChange}
              />
              <input
                type="email"
                id="cmp_email"
                value={formData.cmp_email}
                onChange={handleChange}
              />
              <input
                type="email"
                id="admin_email"
                value={formData.admin_email}
                onChange={handleChange}
              />
              <input
                type="password"
                id="admin_email_password"
                value={formData.admin_email_password}
                onChange={handleChange}
              />
              <input
                type="text"
                id="contact1"
                value={formData.contact1}
                onChange={handleChange}
              />
              <input
                type="text"
                id="contact2"
                value={formData.contact2}
                onChange={handleChange}
              />
              <textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
              <input
                type="text"
                id="allowed_ip"
                value={formData.allowed_ip}
                onChange={handleChange}
              />
            </div>

            {/* VISIBLE FIELDS Starting Here */}

            {/* Show GPay */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%]">
              <div className="flex items-center space-x-3">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="show_gpay"
                    id="show_gpay"
                    className="peer absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-[#727cf5]"
                    checked={formData.show_gpay}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="show_gpay"
                    className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-[#727cf5]"
                  ></label>
                </div>
                <label
                  htmlFor="show_gpay"
                  className="font-medium text-gray-700"
                >
                  Show GPay
                </label>
              </div>
            </div>

            {/* Use Common Payment System (Legacy d-none, but referenced in js?) 
               Wait, looking at manage_setting.php line 70, the WHOLE row for pay_type has 'd-none'.
               AND pay_type_2 (Payment Script) has 'd-none'.
               AND pay_type_1 (UPI) is visible.
               
               Let's re-read the legacy file carefully.
               Line 70: <div class="row d-none"> ... id="pay_type" ... </div>
               Line 77: <div class="row pay_type_2 d-none"> ... id="payment_script" ... </div>
               Line 94: <div class="row pay_type_1"> ... id="upi" ... </div>
               
               So in the default legacy state:
               - The SWITCH to change payment type is HIDDEN.
               - The PAYMENT SCRIPT input is HIDDEN.
               - The UPI input is VISIBLE.
               
               This implies the system is hardcoded to UPI mode in the UI, unless someone removes d-none manually.
               However, the JS `manage_payment_div` TOGGLES classes based on the checkbox state.
               So if the DB has `pay_type = 1` (true), the JS acts.
               But if the checkbox itself is hidden, the user can't toggle it.
               
               I will assume the user wants the "Active" parts of legacy.
               If strictly following legacy HTML: 
               - Only Show GPay, Password, UPI, Pixel are visible.
            */}

            {/* Rendering UPI Field (pay_type_1) - Visible if pay_type is false (UPI mode) */}
            {!formData.pay_type && (
              <div className="md:ml-[16.666667%] md:w-[66.666667%]">
                <label
                  htmlFor="upi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  UPI ID
                </label>
                <input
                  type="text"
                  id="upi"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.upi}
                  onChange={handleChange}
                  placeholder="UPI ID"
                  required
                />
                <div className="text-red-500 text-xs mt-1 hidden">
                  Please enter UPI ID.
                </div>
              </div>
            )}

            {/* Rendering Payment Script (pay_type_2) - Visible if pay_type is true */}
            {formData.pay_type && (
              <div className="md:ml-[16.666667%] md:w-[66.666667%]">
                <label
                  htmlFor="payment_script"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Script
                </label>
                <input
                  type="text"
                  id="payment_script"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.payment_script}
                  onChange={handleChange}
                  placeholder="Payment Script"
                />
              </div>
            )}

            {/* Transaction Password */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%]">
              <label
                htmlFor="tb_password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="tb_password"
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  value={formData.tb_password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Pixel Code */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%]">
              <label
                htmlFor="pixel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pixel Code
              </label>
              <textarea
                id="pixel"
                rows="4"
                className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.pixel}
                onChange={handleChange}
                placeholder="Pixel Code"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%] text-right">
              {/* Offset matching legacy offset-sm-3 if possible, mimicking structure */}
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-[#727cf5] border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#5b66d1] active:bg-[#5b66d1] focus:outline-none focus:border-[#5b66d1] focus:ring ring-[#aeb4ff] disabled:opacity-25 transition ease-in-out duration-150"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
