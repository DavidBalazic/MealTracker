const nodemailer = require("nodemailer");
var nodemailerEmail = process.env.NODEMAILER_GMAIL;
var nodemailerPass = process.env.NODEMAILER_GMAIL_PASS; // https://myaccount.google.com/apppasswords

if (!process.env.NODEMAILER_GMAIL && !process.env.NODEMAILER_GMAIL_PASS)
  nodemailerEmail = "foodservice.mailer@gmail.com";

const transporter = nodemailer.createTransport(
  process.env.NODEMAILER_GMAIL && process.env.NODEMAILER_GMAIL_PASS
    ? {
        service: "gmail",
        auth: {
          user: nodemailerEmail,
          pass: nodemailerPass,
        },
      }
    : {
        host: "smtp-relay.brevo.com",
        port: "587",
        secure: false,
        auth: {
          user: "837157001@smtp-brevo.com",
          pass: process.env.BREVO_API_KEY,
        },
      }
);
console.log("using email: " + nodemailerEmail);

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"FoodTracker" ${nodemailerEmail}`,
      to: to,
      subject: subject,
      html: text,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
