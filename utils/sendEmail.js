const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // a Gmail "App Password", not your real password
    },
  });
  return transporter;
}

/**
 * Sends an email. Returns true on success, false if email isn't configured
 * or sending failed - callers should NOT reveal which of these happened to
 * the end user (that would leak whether an account exists), just log it.
 */
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set - skipping send. Would have sent:', { to, subject });
    return false;
  }

  try {
    await t.sendMail({
      from: `"LawSuite" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[email] Failed to send:', error.message);
    return false;
  }
}

module.exports = { sendEmail };
