const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Komorebi Manga Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

module.exports = { sendEmail }
