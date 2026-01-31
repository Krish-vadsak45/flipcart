const db = require("../config/db");
const logAction = require("../utils/logger");

const getSettings = async (req, res) => {
  try {
    const [settings] = await db.query("SELECT * FROM tbl_setting WHERE id = 1");
    if (settings.length > 0) {
      const data = settings[0];
      // Convert tinyint to boolean for frontend convenience if needed
      data.show_gpay = Boolean(data.show_gpay);
      data.show_phonepe = Boolean(data.show_phonepe);
      data.show_paytm = Boolean(data.show_paytm);
      data.pay_type = Boolean(data.pay_type);
      res.json({ success: true, data: data });
    } else {
      res.json({ success: false, message: "Settings not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      cmp_name,
      cmp_email,
      admin_email,
      admin_email_password,
      contact1,
      contact2,
      address,
      show_gpay,
      show_phonepe,
      show_paytm,
      pay_type,
      payment_script,
      allowed_ip,
      upi,
      pixel,
    } = req.body;

    const query = `
        UPDATE tbl_setting SET 
        cmp_name = ?, cmp_email = ?, admin_email = ?, admin_email_password = ?, 
        contact1 = ?, contact2 = ?, address = ?, show_gpay = ?, show_phonepe = ?, 
        show_paytm = ?, pay_type = ?, payment_script = ?, allowed_ip = ?, upi = ?, pixel = ?
        WHERE id = 1
    `;

    const values = [
      cmp_name,
      cmp_email,
      admin_email,
      admin_email_password,
      contact1,
      contact2,
      address,
      show_gpay ? 1 : 0,
      show_phonepe ? 1 : 0,
      show_paytm ? 1 : 0,
      pay_type ? 1 : 0,
      payment_script,
      allowed_ip,
      upi,
      pixel,
    ];

    await db.query(query, values);
    logAction(req, "Update", "update_settings");
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
