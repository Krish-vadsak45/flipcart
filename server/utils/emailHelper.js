const nodemailer = require("nodemailer");
const db = require("../config/db");

const sendEmail = async (to, subject, html) => {
  try {
    // Fetch SMTP settings from the database
    const [settings] = await db.query("SELECT * FROM tbl_settings LIMIT 1");
    if (settings.length === 0) {
      throw new Error("SMTP settings not found in database.");
    }

    const { admin_email, admin_email_password, company_name } = settings[0];

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // You might want to make this dynamic if stored in DB, but PHP code had it hardcoded as smtp.gmail.com
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: admin_email,
        pass: admin_email_password,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"${company_name}" <${admin_email}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    return {
      success: true,
      message: "Message has been sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Mailer Error: " + error.message };
  }
};

module.exports = sendEmail;
