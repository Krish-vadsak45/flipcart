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

    // Validate recipients
    const recipientProvided = !!(
      (Array.isArray(to) && to.length > 0) ||
      (typeof to === "string" && to.trim() !== "")
    );

    if (!recipientProvided) {
      console.warn(
        "No recipient provided to sendEmail(); falling back to admin_email",
      );
      to = admin_email; // fallback to admin email from settings
    }

    const mailOptions = {
      from: `"${company_name}" <${admin_email}>`,
      to: to,
      subject: subject || `${company_name} Notification`,
      html: html || "",
    };

    console.debug("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    // Send mail
    const info = await transporter.sendMail(mailOptions);

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
