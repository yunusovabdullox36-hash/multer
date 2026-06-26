// Har bir himoyalangan route dan oldin ishlaydi
// Authorization header'dan token olib, tekshiradi

const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  // 1. Header dan tokenni olish
  // Client: Authorization: Bearer eyJhbGci...
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token topilmadi' });
  }

  // 2. "Bearer " qismini olib tashlab, tokenni ajratib olamiz
  const token = authHeader.split(' ')[1];
  // "Bearer eyJhbGci..." → "eyJhbGci..."

  // 3. Tokenni verify qilish
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // decoded = { id: "67abc...", iat: 1234..., exp: 1234... }

    req.user = decoded;
    // req.user.id → controller da ishlatamiz
    // next() chaqirgandan keyin controller ishga tushadi

    next();
  } catch (error) {
    // Token noto'g'ri yoki muddati tugagan (TokenExpiredError)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token muddati tugagan', expired: true });
    }
    return res.status(401).json({ message: 'Token yaroqsiz' });
  }
};

module.exports = { verifyAccessToken };