const nodemailer = require('nodemailer');
const config = require('../config/env');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

async function sendOtpEmail(email, otpCode, username) {
  await transporter.sendMail({
    from: `"HBE Boutique" <${config.smtp.user}>`,
    to: email,
    subject: 'Votre code de vérification - HBE Boutique',
    html: `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 500px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px;">
          <h2>Bonjour ${username},</h2>
          <p>Voici votre code de vérification :</p>
          <div style="font-size: 36px; font-weight: bold; color: #7c3aed; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; letter-spacing: 5px;">${otpCode}</div>
          <p>Ce code est valable pendant <strong>15 minutes</strong>.</p>
        </div>
      </body>
      </html>
    `
  });
}

module.exports = { sendOtpEmail };
