// Fayl yuklash va o'chirish logikasi
// Multer middleware allaqachon Cloudinary'ga yuklab, req.file ni to'ldirgan

const cloudinary = require('../config/cloudinary');
const User       = require('../models/user.model');

// ─── AVATAR YUKLASH ────────────────────────────────────────────────────────

const uploadAvatar = async (req, res) => {
  try {
    // Multer middleware ishlagandan keyin bu yerga kelamiz
    if (!req.file) {
      return res.status(400).json({ message: 'Fayl topilmadi' });
    }

    // multer-storage-cloudinary req.file ni shunday to'ldiradi:
    const imageUrl = req.file.path;      // → "https://res.cloudinary.com/..."
    const publicId = req.file.filename;  // → "uploads/abc123xyz"

    // Userni topib, avatarini yangilash
    const user = await User.findByIdAndUpdate(
      req.user.id,       // verifyAccessToken middleware dan keladi
      { avatar: imageUrl },
      { new: true }      // yangilangan documentni qaytaradi
    ).select('-password -refreshToken');

    res.json({
      message: 'Avatar muvaffaqiyatli yuklandi',
      imageUrl, // client bu URL ni ko'rsatish uchun ishlatadi
      publicId, // keyinchalik o'chirish uchun saqlab qo'yish mumkin
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── RASM O'CHIRISH ────────────────────────────────────────────────────────

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    // publicId misol: "uploads/abc123xyz"
    // Bu ni Cloudinary'dan o'chirish uchun ishlatamiz

    if (!publicId) {
      return res.status(400).json({ message: 'publicId topilmadi' });
    }

    // Cloudinary SDK orqali o'chirish
    const result = await cloudinary.uploader.destroy(publicId);
    // result = { result: 'ok' } yoki { result: 'not found' }

    if (result.result !== 'ok') {
      return res.status(400).json({
        message: 'Rasm o\'chirilmadi',
        cloudinaryResult: result,
      });
    }

    // Agar bu user avatari bo'lsa, DB dan ham o'chirish
    await User.findByIdAndUpdate(req.user.id, { avatar: '' });

    res.json({ message: 'Rasm muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadAvatar, deleteImage };