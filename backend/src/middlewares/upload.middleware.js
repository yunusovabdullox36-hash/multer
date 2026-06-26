// Multer + Cloudinary birga ishlaydi
// Fayl client dan keladi → Multer ushlab oladi →
// CloudinaryStorage avtomatik Cloudinary'ga yuklaydi

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// 1. CloudinaryStorage — fayllar qayerga saqlanishini belgilaydi
const storage = new CloudinaryStorage({
  cloudinary, // bizning sozlangan cloudinary instance

  params: {
    folder: 'uploads',
    // Cloudinary'da "uploads" papkasiga joylashadi
    // Masalan: uploads/image_abc123

    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // Bu yerda faqat ruxsat etilgan formatlar

    transformation: [{ width: 800, crop: 'limit' }],
    // Yuklanganda avtomatik 800px ga kichraytiradi (proporsiya saqlanadi)
    // Bu serverda saqlash uchun ham, foydalanuvchi uchun ham yaxshi
  },
});

// 2. Multer instance — storage va qo'shimcha tekshiruvlar bilan
const upload = multer({
  storage, // yuqorida yaratgan CloudinaryStorage

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimal hajm
    // 5 * 1024 * 1024 = 5,242,880 byte
  },

  fileFilter: (req, file, cb) => {
    // cb(error, accept?) — qabul qilish/rad etish
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);  // qabul qil
    } else {
      cb(new Error('Faqat rasm fayllari ruxsat etiladi!'), false); // rad et
    }
  },
});

module.exports = upload;

// Ishlatish (routes da):
// upload.single('fieldName')  → bitta fayl
// upload.array('fieldName', 5) → max 5 ta fayl
// upload.fields([...])         → turli nomli maydonlar