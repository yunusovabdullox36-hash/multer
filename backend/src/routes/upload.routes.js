const express = require('express');
const router  = express.Router();
const {
  uploadAvatar,
  deleteImage,
} = require('../controllers/upload.controller');
const { verifyAccessToken }  = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// POST /api/upload/avatar
// Ketma-ketlik: verifyAccessToken → upload.single → uploadAvatar
//
// 1. verifyAccessToken: token tekshiradi, req.user qo'yadi
// 2. upload.single('avatar'): faylni Cloudinary'ga yuklaydi, req.file qo'yadi
// 3. uploadAvatar: DB ga saqlaydi, javob qaytaradi
router.post(
  '/avatar',
  verifyAccessToken,
  upload.single('avatar'), // 'avatar' → form-data field nomi
  uploadAvatar
);

// DELETE /api/upload/image
router.delete(
  '/image',
  verifyAccessToken,
  deleteImage
);

module.exports = router;