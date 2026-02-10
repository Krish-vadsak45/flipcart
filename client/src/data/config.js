/**
 * Global application settings.
 * This file acts as the primary source of truth for the application's configuration
 * when running in client-side mode (without a backend server).
 */

export const INITIAL_SETTINGS = {
  id: "1",
  cmp_name: "Flipcart",
  cmp_email: "support@flipcart.com",
  admin_email: "admin@flipcart.com",
  admin_email_password: "",
  contact1: "9876543210",
  contact2: "",
  address: "123, eCommerce Street, Digital City",
  show_gpay: true,
  show_phonepe: true,
  show_paytm: true,
  pay_type: false, // false = UPI (pay_type_1), true = Common (pay_type_2)
  payment_script: "",
  allowed_ip: "",
  upi: "example@upi",
  pixel: "",
  is_maintenance: false, // Added to support client-side maintenance mode
};
