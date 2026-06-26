const express  = require('express');
const router   = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

// Ochiq routelar — token talab qilmaydi
router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);  // access token olish uchun
router.post('/logout',   logout);

// Himoyalangan route — token tekshiriladi
// verifyAccessToken → getMe ketma-ketlikda ishlaydi
router.get('/me', verifyAccessToken, getMe);

module.exports = router;