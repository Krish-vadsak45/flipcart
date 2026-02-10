import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { localService } from "../../services/localService";

const Settings = () => {
  const [loading, setLoading] = useState(true);
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
    show_phonepe: true,
    show_paytm: true,
    pay_type: false,
    payment_script: "",
    allowed_ip: "",
    upi: "",
    pixel: "",
    is_maintenance: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await localService.getSettings();
      if (res.success) {
        setFormData(res.data);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    toast.error(
      "Settings are read-only. Edit client/src/data/config.js instead.",
    );
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

      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Settings are managed in <strong>client/src/data/config.js</strong>
              . Edit that file and redeploy to update these values.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8">
          <form className="space-y-6 max-w-4xl">
            {/* Hidden Fields (Legacy parity - present in DOM but hidden) */}
            <div className="hidden">
              <input type="text" value={formData.cmp_name} readOnly />
              <input type="email" value={formData.cmp_email} readOnly />
              <input type="email" value={formData.admin_email} readOnly />
              <input
                type="password"
                value={formData.admin_email_password}
                readOnly
              />
              <input type="text" value={formData.contact1} readOnly />
              <input type="text" value={formData.contact2} readOnly />
              <textarea value={formData.address} readOnly></textarea>
              <input type="text" value={formData.allowed_ip} readOnly />
            </div>

            {/* Payment Methods Visibility */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%] space-y-4">
              {[
                {
                  id: "show_gpay",
                  label: "Show GPay",
                  value: formData.show_gpay,
                },
                {
                  id: "show_phonepe",
                  label: "Show PhonePe",
                  value: formData.show_phonepe,
                },
                {
                  id: "show_paytm",
                  label: "Show PayTM",
                  value: formData.show_paytm,
                },
                {
                  id: "pay_type",
                  label: "Use Common Payment System",
                  value: formData.pay_type,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="peer absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-[#727cf5] disabled:cursor-not-allowed"
                      checked={item.value}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor={item.id}
                      className="block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-[#727cf5]"
                    ></label>
                  </div>
                  <label
                    htmlFor={item.id}
                    className="font-medium text-gray-700"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>

            {/* UPI ID Field (Visible if pay_type is false) */}
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
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border bg-gray-50 text-gray-500"
                  value={formData.upi}
                  readOnly
                />
              </div>
            )}

            {/* Payment Script Field (Visible if pay_type is true) */}
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
                  className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border bg-gray-50 text-gray-500"
                  value={formData.payment_script}
                  readOnly
                />
              </div>
            )}

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
                className="w-full border-gray-300 rounded-md shadow-sm p-2.5 border bg-gray-50 text-gray-500"
                value={formData.pixel}
                readOnly
              ></textarea>
            </div>

            {/* Maintenance Mode */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%] flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="is_maintenance"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={formData.is_maintenance}
                readOnly
              />
              <label
                htmlFor="is_maintenance"
                className="text-sm font-medium text-gray-700"
              >
                Enable Maintenance Mode (Hides storefront)
              </label>
            </div>

            {/* Submit Button (Read Only) */}
            <div className="md:ml-[16.666667%] md:w-[66.666667%] text-right">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-gray-400 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest cursor-not-allowed opacity-50"
                disabled
              >
                Read Only (Edit config.js)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
