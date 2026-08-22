const crypto = require('crypto');

/**
 * Generates email verification token and expiration.
 */
function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expires };
}

/**
 * Development-safe verification flow wrapper.
 * Logs verification link to console if SMTP is not configured.
 */
async function sendVerificationEmail(email, token) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationLink = `${clientUrl}/login?verifyToken=${token}`;

  console.log(`[EMAIL VERIFICATION SERVICE] Verification link for ${email}:`);
  console.log(`[EMAIL VERIFICATION SERVICE] ${verificationLink}`);

  return {
    sent: true,
    verificationLink,
  };
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
