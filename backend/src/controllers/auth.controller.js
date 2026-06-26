const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const User     = require('../models/user.model');

// ─── Token yaratish funksiyalari ──────────────────────────────────────────────

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },                      // payload — token ichida nima bo'lsin
    process.env.JWT_ACCESS_SECRET,       // imzolash uchun secret
    { expiresIn: '15m' }                 // 15 daqiqa — qisqa muddatli
  );
};
// Nima uchun 15 daqiqa?
// Agar access token o'g'irlansa, 15 daqiqadan keyin avtomatik bekor bo'ladi.

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,      // BOSHQA secret!
    { expiresIn: '7d' }                  // 7 kun — uzoq muddatli
  );
};
// Refresh token uzoq yashaydi, lekin DB da saqlanadi.
// Logout bo'lsa — DB dan o'chiriladi va token yaroqsiz bo'ladi.

// ─── REGISTER ────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Email band emasligini tekshirish
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    // 2. Parolni hash qilish (controller da, model da emas)
    const hashedPassword = await bcrypt.hash(password, 10);
    // 10 → salt rounds: qanchalik katta bo'lsa, shunchalik sekin va xavfsiz

    // 3. Foydalanuvchi yaratish
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Tokenlar yaratish
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 5. Refresh tokenni DB ga saqlash
    await User.findByIdAndUpdate(user._id, { refreshToken });

    // 6. Javob qaytarish
    res.status(201).json({
      message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz',
      accessToken,   // client bu ni xotirada (memory) saqlaydi
      refreshToken,  // client bu ni localStorage/cookie da saqlaydi
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User topish
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    // 2. Parolni tekshirish
    const isMatch = await bcrypt.compare(password, user.password);
    // bcrypt.compare: plain text va hash ni taqqoslaydi
    if (!isMatch) {
      return res.status(401).json({ message: 'Parol noto\'g\'ri' });
    }

    // 3. Yangi tokenlar yaratish
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 4. Yangi refresh tokenni DB ga yozish (eski o'rniga)
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      message: 'Muvaffaqiyatli kirildi',
      accessToken,
      refreshToken,
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── REFRESH ─────────────────────────────────────────────────────────────────

// Access token muddati tugaganda, client bu endpoint ga murojaat qiladi
// Yangi access token + yangi refresh token oladi (Token Rotation)

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token topilmadi' });
    }

    // 1. Refresh tokenni verify qilish
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Refresh token yaroqsiz yoki muddati tugagan' });
    }

    // 2. DB dagi user topish va tokenni solishtirish
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: 'Foydalanuvchi topilmadi' });
    }

    if (user.refreshToken !== refreshToken) {
      // Tokenlar mos kelmasa → kimdir eski tokenni ishlatmoqda!
      // Xavfsizlik uchun DB dagi tokenni ham o'chiramiz
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      return res.status(403).json({ message: 'Token mos kelmadi. Qayta login qiling.' });
    }

    // 3. Yangi tokenlar yaratish (Token Rotation)
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // 4. Yangi refresh tokenni DB ga yozish
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.json({
      accessToken:  newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // DB dan refresh tokenni o'chirish
      // Endi bu refresh token bilan yangi access token olib bo'lmaydi
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null }
      );
    }

    res.json({ message: 'Muvaffaqiyatli chiqildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────

// Himoyalangan route — verifyAccessToken middleware orqali keladi
// req.user.id → middleware da decoded dan qo'yilgan

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    // .select('-password -refreshToken') → bu maydonlarni olib tashla

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, refresh, logout, getMe };