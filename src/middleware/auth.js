const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.',
  standardHeaders: true,
  legacyHeaders: false
});

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/backend/login');
}

async function verifyLogin(username, password) {
  const expectedUser = process.env.CMS_USER;
  const expectedHash = process.env.CMS_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    console.error('CMS_USER or CMS_PASSWORD_HASH not set in environment variables');
    return false;
  }

  if (username !== expectedUser) {
    // Still do bcrypt compare to prevent timing attacks
    await bcrypt.compare(password, '$2b$10$invalidhashtopreventtimingattacks000000000000000');
    return false;
  }

  return bcrypt.compare(password, expectedHash);
}

module.exports = { requireAuth, verifyLogin, loginLimiter };
